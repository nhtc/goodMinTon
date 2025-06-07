import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'

// ...existing code...

// GET - Fetch all games
// GET - Include pre-pay data in response
export async function GET() {
  try {
    const games = await prisma.game.findMany({
      include: {
        participants: {
          include: {
            member: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Transform the response to include payment and pre-pay data
    const transformedGames = games.map(game => ({
      ...game,
      participants: game.participants.map(p => ({
        ...p.member,
        participantId: p.id,
        hasPaid: p.hasPaid,
        paidAt: p.paidAt,
        prePaid: p.prePaid // ✅ Include pre-pay data
      }))
    }))

    return NextResponse.json(transformedGames)
  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    )
  }
}

// ...existing POST and DELETE code remains the same...
// POST - Create a new game
// POST - Create a new game
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      date,
      location,
      yardCost,
      shuttleCockQuantity,
      shuttleCockPrice,
      otherFees,
      totalCost,
      memberIds,
      costPerMember,
      memberPrePays = {} // ✅ Add pre-pays
    } = body

    // Validate required fields
    if (!date || !location || !memberIds || memberIds.length === 0) {
      return NextResponse.json(
        { error: 'Date, location and at least one member are required' },
        { status: 400 }
      )
    }

    // Create game with participants including pre-pays
    const game = await prisma.game.create({
      data: {
        date: new Date(date),
        location: location.trim(),
        yardCost: Number(yardCost) || 0,
        shuttleCockQuantity: Number(shuttleCockQuantity) || 0,
        shuttleCockPrice: Number(shuttleCockPrice) || 0,
        otherFees: Number(otherFees) || 0,
        totalCost: Number(totalCost) || 0,
        costPerMember: Number(costPerMember) || 0,
        costPerGame: Number(totalCost) || 0,
        participants: {
          create: memberIds.map((memberId: string) => ({
            member: {
              connect: { id: memberId }
            },
            prePaid: Number(memberPrePays[memberId]) || 0 // ✅ Include pre-pay
          }))
        }
      },
      include: {
        participants: {
          include: {
            member: true
          }
        }
      }
    })

    // Transform response to include pre-pay data
    const transformedGame = {
      ...game,
      participants: game.participants.map(p => ({
        ...p.member,
        participantId: p.id,
        hasPaid: p.hasPaid,
        paidAt: p.paidAt,
        prePaid: p.prePaid // ✅ Include pre-pay in response
      }))
    }

    return NextResponse.json(transformedGame, { status: 201 })
  } catch (error) {
    console.error('Error creating game:', error)
    return NextResponse.json(
      { error: 'Failed to create game', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}


// DELETE - Delete a game
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      )
    }

    // Check if game exists
    const existingGame = await prisma.game.findUnique({
      where: { id }
    })

    if (!existingGame) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }

    // Delete game (participants will be deleted automatically due to cascade)
    await prisma.game.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Game deleted successfully' })
  } catch (error) {
    console.error('Error deleting game:', error)
    return NextResponse.json(
      { error: 'Failed to delete game' },
      { status: 500 }
    )
  }
}



// PATCH - Toggle payment status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { gameId: string; participantId: string } }
) {
  try {
    const { gameId, participantId } = params
    const body = await request.json()
    const { hasPaid } = body

    // Find the participant
    const participant = await prisma.gameParticipant.findFirst({
      where: {
        gameId,
        memberId: participantId
      }
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      )
    }

    // Update payment status
    const updatedParticipant = await prisma.gameParticipant.update({
      where: {
        id: participant.id
      },
      data: {
        hasPaid: Boolean(hasPaid),
        paidAt: Boolean(hasPaid) ? new Date() : null
      },
      include: {
        member: true,
        game: true
      }
    })

    return NextResponse.json(updatedParticipant)
  } catch (error) {
    console.error('Error updating payment status:', error)
    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    )
  }
}