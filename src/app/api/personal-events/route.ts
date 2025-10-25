import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

// GET - Fetch all personal events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const search = searchParams.get('search') || ''
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const memberId = searchParams.get('memberId')

    // Build where clause for filtering
    const where: any = {}
    
    // Search in title, description, and participant member names
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        {
          participants: {
            some: {
              member: {
                name: { contains: search, mode: 'insensitive' }
              }
            }
          }
        }
      ]
    }

    // Date range filtering
    if (startDate || endDate) {
      where.date = {}
      if (startDate) {
        where.date.gte = new Date(startDate)
      }
      if (endDate) {
        where.date.lte = new Date(endDate)
      }
    }

    // Member filtering - events where specific member is participant
    if (memberId) {
      where.participants = {
        some: {
          memberId: memberId
        }
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Fetch personal events with pagination
    const [personalEvents, totalCount] = await Promise.all([
      prisma.personalEvent.findMany({
        where,
        include: {
          participants: {
            include: {
              member: true
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' },
          { date: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.personalEvent.count({ where })
    ])

    // Transform the response to match PersonalEventParticipant interface
    const transformedEvents = personalEvents.map((event: any) => ({
      ...event,
      participants: event.participants.map((p: any) => ({
        id: p.id,
        personalEventId: event.id,
        memberId: p.member.id,
        customAmount: p.customAmount,
        hasPaid: p.hasPaid,
        paidAt: p.paidAt,
        prePaid: p.prePaid,
        prePaidCategory: p.prePaidCategory,
        member: p.member
      }))
    }))

    return NextResponse.json({
      data: transformedEvents,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching personal events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch personal events' },
      { status: 500 }
    )
  }
}

// POST - Create a new personal event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      date,
      location,
      totalCost,
      participants
    } = body

    // Validate required fields
    if (!title || !date || !participants || participants.length === 0) {
      return NextResponse.json(
        { error: 'Title, date, and at least one participant are required' },
        { status: 400 }
      )
    }

    // Validate participants structure
    const validParticipants = participants.every((p: any) => 
      p.memberId && typeof p.customAmount === 'number' && p.customAmount >= 0
    )

    if (!validParticipants) {
      return NextResponse.json(
        { error: 'Each participant must have a valid memberId and customAmount' },
        { status: 400 }
      )
    }

    // Calculate total cost from participants if not provided
    const calculatedTotalCost = totalCost || participants.reduce(
      (sum: number, p: any) => sum + p.customAmount, 
      0
    )

    // Create personal event with participants
    const personalEvent = await prisma.personalEvent.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        date: new Date(date),
        location: location?.trim() || null,
        totalCost: Number(calculatedTotalCost) || 0,
        participants: {
          create: participants.map((participant: any) => ({
            member: {
              connect: { id: participant.memberId }
            },
            customAmount: Number(participant.customAmount) || 0,
            hasPaid: participant.hasPaid || false,
            paidAt: participant.paidAt ? new Date(participant.paidAt) : null,
            prePaid: Number(participant.prePaid) || 0,
            prePaidCategory: participant.prePaidCategory || ""
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

    // Transform response to match PersonalEventParticipant interface
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

    return NextResponse.json(transformedEvent, { status: 201 })
  } catch (error) {
    console.error('Error creating personal event:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create personal event', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete a personal event
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Personal event ID is required' },
        { status: 400 }
      )
    }

    // Check if personal event exists
    const existingEvent = await prisma.personalEvent.findUnique({
      where: { id }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Personal event not found' },
        { status: 404 }
      )
    }

    // Delete personal event (participants will be deleted automatically due to cascade)
    await prisma.personalEvent.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Personal event deleted successfully' })
  } catch (error) {
    console.error('Error deleting personal event:', error)
    return NextResponse.json(
      { error: 'Failed to delete personal event' },
      { status: 500 }
    )
  }
}