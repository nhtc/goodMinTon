import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface GameWithPayment {
  id: string
  date: string
  location: string
  costPerMember: number
  participantId: string
  hasPaid: boolean
  paidAt: string | null
  prePaid: number
  customAmount: number
  outstandingAmount: number
}

interface PersonalEventWithPayment {
  id: string
  date: string
  title: string
  participantId: string
  hasPaid: boolean
  paidAt: string | null
  prePaid: number
  customAmount: number
  outstandingAmount: number
}

interface PaymentInfoResponse {
  memberId: string
  memberName: string
  games: {
    unpaidGames: GameWithPayment[]
    totalUnpaid: number
    totalGames: number
  }
  personalEvents: {
    unpaidEvents: PersonalEventWithPayment[]
    totalUnpaid: number
    totalEvents: number
  }
  summary: {
    totalOutstanding: number
    totalUnpaidItems: number
  }
}

/**
 * GET /api/members/[id]/payments/info
 * 
 * Returns comprehensive payment information for a specific member
 * Including unpaid games, unpaid personal events, and calculated totals
 * 
 * This endpoint moves calculation logic from frontend to backend
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const memberId = params.id

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    // Fetch member info
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { id: true, name: true, isActive: true }
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Fetch only unpaid game participations for this member
    const gameParticipations = await prisma.gameParticipant.findMany({
      where: {
        memberId: memberId,
        hasPaid: false // Only fetch unpaid games
      },
      include: {
        game: {
          select: {
            id: true,
            date: true,
            location: true,
            costPerMember: true
          }
        }
      },
      orderBy: {
        game: {
          date: 'desc'
        }
      }
    })

    // Calculate unpaid games and total
    const unpaidGames: GameWithPayment[] = []
    let totalGamesOutstanding = 0
    console.log("xxxxxxxx", gameParticipations.length)
    gameParticipations.forEach(participation => {
      const outstandingAmount = 
        participation.game.costPerMember - 
        participation.prePaid + 
        (participation.customAmount || 0)
      
      unpaidGames.push({
        id: participation.game.id,
        date: participation.game.date.toISOString(),
        location: participation.game.location || '',
        costPerMember: participation.game.costPerMember,
        participantId: participation.id,
        hasPaid: participation.hasPaid,
        paidAt: participation.paidAt?.toISOString() || null,
        prePaid: participation.prePaid,
        customAmount: participation.customAmount || 0,
        outstandingAmount
      })
      
      totalGamesOutstanding += outstandingAmount
    })

    // Fetch all personal event participations for this member
    const eventParticipations = await prisma.personalEventParticipant.findMany({
      where: {
        memberId: memberId,
        hasPaid: false 
      },
      include: {
        personalEvent: {
          select: {
            id: true,
            date: true,
            title: true
          }
        }
      },
      orderBy: {
        personalEvent: {
          date: 'desc'
        }
      }
    })
    // Calculate unpaid personal events and total
    const unpaidEvents: PersonalEventWithPayment[] = []
    let totalEventsOutstanding = 0

    eventParticipations.forEach(participation => {
      if (!participation.hasPaid) {
        const outstandingAmount = 
          participation.customAmount - 
          (participation.prePaid || 0)
        
        unpaidEvents.push({
          id: participation.personalEvent.id,
          date: participation.personalEvent.date.toISOString(),
          title: participation.personalEvent.title,
          participantId: participation.id,
          hasPaid: participation.hasPaid,
          paidAt: participation.paidAt?.toISOString() || null,
          prePaid: participation.prePaid || 0,
          customAmount: participation.customAmount,
          outstandingAmount
        })
        
        totalEventsOutstanding += outstandingAmount
      }
    })

    // Prepare response
    const response: PaymentInfoResponse = {
      memberId: member.id,
      memberName: member.name,
      games: {
        unpaidGames,
        totalUnpaid: totalGamesOutstanding,
        totalGames: gameParticipations.length
      },
      personalEvents: {
        unpaidEvents,
        totalUnpaid: totalEventsOutstanding,
        totalEvents: eventParticipations.length
      },
      summary: {
        totalOutstanding: totalGamesOutstanding + totalEventsOutstanding,
        totalUnpaidItems: unpaidGames.length + unpaidEvents.length
      }
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Error fetching member payment info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment information' },
      { status: 500 }
    )
  }
}
