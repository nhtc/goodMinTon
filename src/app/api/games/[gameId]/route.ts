import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// GET - Get a specific game by ID
export async function GET(
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
        prePaidCategory: p.prePaidCategory
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
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ gameId: string }> }
) {
  try {
    const params = await context.params
    const { gameId } = params
    const body = await request.json()
    
    const {
      date,
      location,
      yardCost,
      shuttleCockQuantity,
      shuttleCockPrice,
      otherFees,
      memberIds,
      memberPrePays
    } = body

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      )
    }

    // Check if game exists
    const existingGame = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        participants: true
      }
    })

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
      ? totalCost / memberIds.length 
      : 0

    // Update game details
    const updatedGame = await prisma.game.update({
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

    // Update participants if provided
    if (memberIds) {
      // Remove existing participants
      await prisma.gameParticipant.deleteMany({
        where: { gameId }
      })

      // Add new participants
      if (memberIds.length > 0) {
        await prisma.gameParticipant.createMany({
          data: memberIds.map((memberId: string) => ({
            gameId,
            memberId,
            hasPaid: false,
            prePaid: memberPrePays && memberPrePays[memberId] ? (memberPrePays[memberId].amount || 0) : 0,
            prePaidCategory: memberPrePays && memberPrePays[memberId] ? (memberPrePays[memberId].category || "") : ""
          }))
        })
      }
    }

    // Fetch updated game with participants
    const gameWithParticipants = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        participants: {
          include: {
            member: true
          }
        }
      }
    })

    // Transform the response
    const transformedGame = {
      ...gameWithParticipants,
      participants: gameWithParticipants?.participants.map((p: any) => ({
        ...p.member,
        participantId: p.id,
        hasPaid: p.hasPaid,
        paidAt: p.paidAt,
        prePaid: p.prePaid,
        prePaidCategory: p.prePaidCategory
      }))
    }

    return NextResponse.json(transformedGame)
  } catch (error) {
    console.error('Error updating game:', error)
    return NextResponse.json(
      { error: 'Failed to update game' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a game by ID
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ gameId: string }> }
) {
  try {
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
