import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../../lib/prisma'
import { withAuth, getUser } from '../../../../../../../lib/withAuth'

// POST - Toggle payment status for a participant in a personal event
async function togglePaymentStatus(
  request: NextRequest,
  context: { params: Promise<{ personalEventId: string; memberId: string }> }
) {
  try {
    const user = getUser(request)
    const params = await context.params
    const { personalEventId, memberId } = params

    if (!personalEventId || !memberId) {
      return NextResponse.json(
        { error: 'Personal event ID and member ID are required' },
        { status: 400 }
      )
    }

    // Find the participant
    const participant = await prisma.personalEventParticipant.findUnique({
      where: {
        personalEventId_memberId: {
          personalEventId,
          memberId
        }
      },
      include: {
        member: true,
        personalEvent: true
      }
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found in this personal event' },
        { status: 404 }
      )
    }

    // Toggle payment status
    const updatedParticipant = await prisma.personalEventParticipant.update({
      where: {
        personalEventId_memberId: {
          personalEventId,
          memberId
        }
      },
      data: {
        hasPaid: !participant.hasPaid,
        paidAt: !participant.hasPaid ? new Date() : null
      },
      include: {
        member: true,
        personalEvent: true
      }
    })

    // Transform response to match PersonalEventParticipant interface
    const transformedParticipant = {
      id: updatedParticipant.id,
      personalEventId: updatedParticipant.personalEventId,
      memberId: updatedParticipant.memberId,
      customAmount: updatedParticipant.customAmount,
      hasPaid: updatedParticipant.hasPaid,
      paidAt: updatedParticipant.paidAt,
      member: updatedParticipant.member,
      personalEvent: {
        id: updatedParticipant.personalEvent.id,
        title: updatedParticipant.personalEvent.title
      }
    }

    return NextResponse.json({
      message: `Payment status ${updatedParticipant.hasPaid ? 'marked as paid' : 'marked as unpaid'}`,
      participant: transformedParticipant
    })
  } catch (error) {
    console.error('Error toggling payment status:', error)
    return NextResponse.json(
      { 
        error: 'Failed to toggle payment status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Export wrapped handler
export const POST = withAuth(togglePaymentStatus)