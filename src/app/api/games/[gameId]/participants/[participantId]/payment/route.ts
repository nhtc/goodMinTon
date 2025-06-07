import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH - Toggle payment status
export async function PATCH(
  request: NextRequest,
  // The second argument's type should reflect that 'params' will be a Promise
  { params }: { params: Promise<{ gameId: string; participantId: string }> }
) {
  try {
    // Await the params because it's a Promise
    const { gameId, participantId } = await params;
    const body = await request.json();
    const { hasPaid } = body;

    // Find the participant
    const participant = await prisma.gameParticipant.findFirst({
      where: {
        gameId,
        memberId: participantId
      }
    });

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
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
    });

    return NextResponse.json(updatedParticipant);
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { error: 'Failed to update payment status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}