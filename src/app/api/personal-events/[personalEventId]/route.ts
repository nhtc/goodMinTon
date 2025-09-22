import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { withAuth, getUser } from '../../../../lib/withAuth'

// GET - Get a specific personal event by ID
async function getPersonalEvent(
  request: NextRequest,
  context: { params: Promise<{ personalEventId: string }> }
) {
  try {
    const params = await context.params
    const { personalEventId } = params

    const personalEvent = await prisma.personalEvent.findUnique({
      where: { id: personalEventId },
      include: {
        participants: {
          include: {
            member: true
          }
        }
      }
    })

    if (!personalEvent) {
      return NextResponse.json(
        { error: 'Personal event not found' },
        { status: 404 }
      )
    }

    // Transform the response to match PersonalEventParticipant interface
    const transformedEvent = {
      ...personalEvent,
      participants: personalEvent.participants.map((p: any) => ({
        id: p.id,
        personalEventId: personalEvent.id,
        memberId: p.member.id,
        customAmount: p.customAmount,
        hasPaid: p.hasPaid,
        paidAt: p.paidAt,
        prePaid: p.prePaid,
        prePaidCategory: p.prePaidCategory,
        member: p.member
      }))
    }

    return NextResponse.json(transformedEvent)
  } catch (error) {
    console.error('Error fetching personal event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch personal event' },
      { status: 500 }
    )
  }
}

// PUT - Update a personal event by ID
async function updatePersonalEvent(
  request: NextRequest,
  context: { params: Promise<{ personalEventId: string }> }
) {
  const startTime = Date.now()
  console.log('🚀 Starting personal event update...')
  
  try {
    const user = getUser(request)
    const params = await context.params
    const { personalEventId } = params
    const body = await request.json()
    console.log(`📊 Parse time: ${Date.now() - startTime}ms`)
    
    const {
      title,
      description,
      date,
      location,
      totalCost,
      participants
    } = body

    if (!personalEventId) {
      return NextResponse.json(
        { error: 'Personal event ID is required' },
        { status: 400 }
      )
    }

    const fetchStartTime = Date.now()
    // Check if personal event exists
    const existingEvent = await prisma.personalEvent.findUnique({
      where: { id: personalEventId },
      include: {
        participants: true
      }
    })
    console.log(`🔍 Fetch existing event: ${Date.now() - fetchStartTime}ms`)

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Personal event not found' },
        { status: 404 }
      )
    }

    // Calculate total cost from participants if not provided
    const calculatedTotalCost = totalCost !== undefined ? totalCost : 
      (participants ? participants.reduce((sum: number, p: any) => sum + (p.customAmount || 0), 0) : existingEvent.totalCost)

    const transactionStartTime = Date.now()
    
    // Optimized transaction for remote DB
    console.log('🌐 Using remote DB - optimizing for network latency...')
    
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update personal event details
      await tx.personalEvent.update({
        where: { id: personalEventId },
        data: {
          title: title !== undefined ? title.trim() : existingEvent.title,
          description: description !== undefined ? (description?.trim() || null) : existingEvent.description,
          date: date ? new Date(date) : existingEvent.date,
          location: location !== undefined ? (location?.trim() || null) : existingEvent.location,
          totalCost: Number(calculatedTotalCost) || 0
        }
      })

      // 2. Handle participants efficiently - only if changed
      if (participants) {
        // Validate participants structure
        const validParticipants = participants.every((p: any) => 
          p.memberId && typeof p.customAmount === 'number' && p.customAmount >= 0
        )

        if (!validParticipants) {
          throw new Error('Each participant must have a valid memberId and customAmount')
        }

        const currentMemberIds = new Set(existingEvent.participants.map((p: any) => p.memberId))
        const newMemberIds = new Set(participants.map((p: any) => p.memberId))
        
        // Quick check if participants changed
        const hasChanges = currentMemberIds.size !== newMemberIds.size || 
                          Array.from(currentMemberIds).some(id => !newMemberIds.has(id))
        
        if (hasChanges) {
          // Batch operation: delete all and recreate (fewer DB calls for remote DB)
          const paymentMap = new Map(existingEvent.participants.map((p: any) => [p.memberId, p]))
          
          await tx.personalEventParticipant.deleteMany({ 
            where: { personalEventId } 
          })
          
          if (participants.length > 0) {
            await tx.personalEventParticipant.createMany({
              data: participants.map((participant: any) => {
                const existing = paymentMap.get(participant.memberId)
                return {
                  personalEventId,
                  memberId: participant.memberId,
                  customAmount: Number(participant.customAmount) || 0,
                  hasPaid: participant.hasPaid !== undefined ? participant.hasPaid : (existing?.hasPaid || false),
                  paidAt: participant.paidAt ? new Date(participant.paidAt) : (existing?.paidAt || null),
                  prePaid: Number(participant.prePaid) || 0,
                  prePaidCategory: participant.prePaidCategory || ""
                }
              })
            })
          }
        } else {
          // Only update custom amounts for unchanged participants
          const updates = participants
            .filter((p: any) => {
              const existing: any = existingEvent.participants.find((ep: any) => ep.memberId === p.memberId)
              return existing && (
                p.customAmount !== existing.customAmount ||
                p.hasPaid !== existing.hasPaid ||
                p.paidAt !== existing.paidAt?.toISOString() ||
                (p.prePaid || 0) !== (existing.prePaid || 0) ||
                (p.prePaidCategory || "") !== (existing.prePaidCategory || "")
              )
            })
            .map((p: any) => {
              const existing: any = existingEvent.participants.find((ep: any) => ep.memberId === p.memberId)
              return {
                where: { id: existing!.id },
                data: {
                  customAmount: Number(p.customAmount) || 0,
                  hasPaid: p.hasPaid !== undefined ? p.hasPaid : existing!.hasPaid,
                  paidAt: p.paidAt ? new Date(p.paidAt) : (p.hasPaid === false ? null : existing!.paidAt),
                  prePaid: Number(p.prePaid) || 0,
                  prePaidCategory: p.prePaidCategory || ""
                }
              }
            })
          
          // Execute updates in parallel (but limit concurrency for remote DB)
          const BATCH_SIZE = 5
          for (let i = 0; i < updates.length; i += BATCH_SIZE) {
            const batch = updates.slice(i, i + BATCH_SIZE)
            await Promise.all(batch.map((update: any) => 
              tx.personalEventParticipant.update(update)
            ))
          }
        }
      }

      // 3. Return result in same transaction
      return await tx.personalEvent.findUnique({
        where: { id: personalEventId },
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
    // Transform the response to match PersonalEventParticipant interface
    const transformedEvent = {
      ...result,
      participants: result?.participants.map((p: any) => ({
        id: p.id,
        personalEventId: personalEventId,
        memberId: p.member.id,
        customAmount: p.customAmount,
        hasPaid: p.hasPaid,
        paidAt: p.paidAt,
        prePaid: p.prePaid,
        prePaidCategory: p.prePaidCategory,
        member: p.member
      }))
    }
    console.log(`🔄 Transform response: ${Date.now() - transformStartTime}ms`)

    const endTime = Date.now()
    console.log(`✅ Total personal event update: ${endTime - startTime}ms`)

    return NextResponse.json(transformedEvent)
  } catch (error) {
    const endTime = Date.now()
    console.error(`❌ Personal event update failed after ${endTime - startTime}ms:`, error)
    return NextResponse.json(
      { 
        error: 'Failed to update personal event',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete a personal event by ID
async function deletePersonalEvent(
  request: NextRequest,
  context: { params: Promise<{ personalEventId: string }> }
) {
  try {
    const user = getUser(request)
    const params = await context.params
    const { personalEventId } = params

    if (!personalEventId) {
      return NextResponse.json(
        { error: 'Personal event ID is required' },
        { status: 400 }
      )
    }

    // Check if personal event exists
    const existingEvent = await prisma.personalEvent.findUnique({
      where: { id: personalEventId }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Personal event not found' },
        { status: 404 }
      )
    }

    // Delete the personal event (participants will be deleted automatically due to onDelete: Cascade)
    await prisma.personalEvent.delete({
      where: { id: personalEventId }
    })

    return NextResponse.json(
      { message: 'Personal event deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting personal event:', error)
    return NextResponse.json(
      { error: 'Failed to delete personal event' },
      { status: 500 }
    )
  }
}

// Export wrapped handlers
export const GET = getPersonalEvent
export const PUT = withAuth(updatePersonalEvent)
export const DELETE = withAuth(deletePersonalEvent)