import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { withAuth, getUser } from '../../../../lib/withAuth'

// GET - Get a specific game by ID
async function getGame(
  request: NextRequest,
  context: { params: Promise<{ gameId: string }> }
) {
  try {
    const params = await context.params
    const { gameId } = params

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        participants: {
          include: {
            member: true
          }
        }
      }
    })

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }

    // Transform the response to include payment and pre-pay data
    const transformedGame = {
      ...game,
      participants: game.participants.map((p: any) => ({
        ...p.member,
        participantId: p.id,
        hasPaid: p.hasPaid,
        paidAt: p.paidAt,
        prePaid: p.prePaid,
        prePaidCategory: p.prePaidCategory,
        customAmount: p.customAmount
      }))
    }

    return NextResponse.json(transformedGame)
  } catch (error) {
    console.error('Error fetching game:', error)
    return NextResponse.json(
      { error: 'Failed to fetch game' },
      { status: 500 }
    )
  }
}

// PUT - Update a game by ID
async function updateGame(
  request: NextRequest,
  context: { params: Promise<{ gameId: string }> }
) {
  const startTime = Date.now()
  console.log('🚀 Starting game update...')
  
  try {
    const user = getUser(request)
    const params = await context.params
    const { gameId } = params
    const body = await request.json()
    console.log(`📊 Parse time: ${Date.now() - startTime}ms`)
    
    const {
      date,
      location,
      yardCost,
      shuttleCockQuantity,
      shuttleCockPrice,
      otherFees,
      memberIds,
      memberPrePays,
      memberCustomAmounts = {}
    } = body

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      )
    }

    const fetchStartTime = Date.now()
    // Check if game exists
    const existingGame = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        participants: true
      }
    })
    console.log(`🔍 Fetch existing game: ${Date.now() - fetchStartTime}ms`)

    if (!existingGame) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }

    // Calculate costs
    const shuttleCockCost = (shuttleCockQuantity || 0) * (shuttleCockPrice || 0)
    const totalCost = (yardCost || 0) + shuttleCockCost + (otherFees || 0)
    const costPerMember = memberIds && memberIds.length > 0 
      ? Math.ceil((totalCost / memberIds.length) / 1000) * 1000
      : 0

    const transactionStartTime = Date.now()
    
    // For remote DB, minimize transaction complexity and DB calls
    console.log('🌐 Using remote DB - optimizing for network latency...')
    
    // Strategy: Single efficient update transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update game details (required)
      await tx.game.update({
        where: { id: gameId },
        data: {
          date: date ? new Date(date) : existingGame.date,
          location: location !== undefined ? location : existingGame.location,
          yardCost: yardCost !== undefined ? yardCost : existingGame.yardCost,
          shuttleCockQuantity: shuttleCockQuantity !== undefined ? shuttleCockQuantity : existingGame.shuttleCockQuantity,
          shuttleCockPrice: shuttleCockPrice !== undefined ? shuttleCockPrice : existingGame.shuttleCockPrice,
          otherFees: otherFees !== undefined ? otherFees : existingGame.otherFees,
          totalCost,
          costPerMember
        }
      })

      // 2. Handle participants efficiently - only if changed
      if (memberIds) {
        const currentMemberIds = new Set(existingGame.participants.map(p => p.memberId))
        const newMemberIds = new Set(memberIds)
        
        // Quick check if anything changed
        const hasChanges = currentMemberIds.size !== newMemberIds.size || 
                          Array.from(currentMemberIds).some(id => !newMemberIds.has(id))
        
        if (hasChanges) {
          // Batch operation: delete all and recreate (fewer DB calls for remote DB)
          const paymentMap = new Map(existingGame.participants.map(p => [p.memberId, p]))
          
          await tx.gameParticipant.deleteMany({ where: { gameId } })
          
          if (memberIds.length > 0) {
            await tx.gameParticipant.createMany({
              data: memberIds.map((memberId: string) => {
                const existing = paymentMap.get(memberId)
                return {
                  gameId,
                  memberId,
                  hasPaid: existing?.hasPaid || false,
                  paidAt: existing?.paidAt || null,
                  prePaid: memberPrePays?.[memberId]?.amount || existing?.prePaid || 0,
                  prePaidCategory: memberPrePays?.[memberId]?.category || existing?.prePaidCategory || "",
                  customAmount: Number(memberCustomAmounts[memberId]) || (existing as any)?.customAmount || 0
                }
              })
            })
          }
        } else if (memberPrePays || memberCustomAmounts) {
          // Only update pre-pays and custom amounts for unchanged participants (batch update)
          const updates = existingGame.participants
            .filter(p => memberPrePays?.[p.memberId] || memberCustomAmounts?.[p.memberId] !== undefined)
            .map(p => ({
              where: { id: p.id },
              data: {
                prePaid: memberPrePays?.[p.memberId]?.amount ?? p.prePaid,
                prePaidCategory: memberPrePays?.[p.memberId]?.category ?? p.prePaidCategory,
                customAmount: Number(memberCustomAmounts[p.memberId]) || (p as any).customAmount || 0
              }
            }))
          
          // Execute updates in parallel (but limit concurrency for remote DB)
          const BATCH_SIZE = 5
          for (let i = 0; i < updates.length; i += BATCH_SIZE) {
            const batch = updates.slice(i, i + BATCH_SIZE)
            await Promise.all(batch.map(update => 
              tx.gameParticipant.update(update)
            ))
          }
        }
      }

      // 3. Return result in same transaction (single query)
      return await tx.game.findUnique({
        where: { id: gameId },
        include: {
          participants: {
            include: { member: true }
          }
        }
      })
    }, {
      timeout: 15000, // Increase timeout for remote DB
      maxWait: 5000,  // Max wait time to acquire transaction
    })
    
    console.log(`🏁 Remote DB transaction: ${Date.now() - transactionStartTime}ms`)

    const transformStartTime = Date.now()
    // Transform the response
    const transformedGame = {
      ...result,
      participants: result?.participants.map((p: any) => ({
        ...p.member,
        participantId: p.id,
        hasPaid: p.hasPaid,
        paidAt: p.paidAt,
        prePaid: p.prePaid,
        prePaidCategory: p.prePaidCategory,
        customAmount: p.customAmount
      }))
    }
    console.log(`🔄 Transform response: ${Date.now() - transformStartTime}ms`)

    const endTime = Date.now()
    console.log(`✅ Total game update: ${endTime - startTime}ms`)

    return NextResponse.json(transformedGame)
  } catch (error) {
    const endTime = Date.now()
    console.error(`❌ Game update failed after ${endTime - startTime}ms:`, error)
    return NextResponse.json(
      { error: 'Failed to update game' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a game by ID
async function deleteGame(
  request: NextRequest,
  context: { params: Promise<{ gameId: string }> }
) {
  try {
    const user = getUser(request)
    const params = await context.params
    const { gameId } = params

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      )
    }

    // Check if game exists
    const existingGame = await prisma.game.findUnique({
      where: { id: gameId }
    })

    if (!existingGame) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }

    // Delete the game (participants will be deleted automatically due to onDelete: Cascade)
    await prisma.game.delete({
      where: { id: gameId }
    })

    return NextResponse.json(
      { message: 'Game deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting game:', error)
    return NextResponse.json(
      { error: 'Failed to delete game' },
      { status: 500 }
    )
  }
}

// Export wrapped handlers
export const GET = getGame
export const PUT = withAuth(updateGame)
export const DELETE = withAuth(deleteGame)
