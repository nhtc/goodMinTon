import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

// GET - Fetch games with pagination and filtering support
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const paginate = searchParams.get('paginate') !== 'false' // Default to true
    const searchTerm = searchParams.get('search') || ''
    const paymentStatus = searchParams.get('paymentStatus') || 'all' // 'all', 'paid', 'unpaid'
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit

    // Build where clause for filtering
    const whereClause: any = {}
    
    // Search filter (search in location, date, or participant names)
    if (searchTerm) {
      whereClause.OR = [
        {
          location: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          participants: {
            some: {
              member: {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive'
                }
              }
            }
          }
        }
      ]
    }

    // If pagination is disabled, return all filtered games (backward compatibility)
    if (!paginate) {
      const games = await prisma.game.findMany({
        where: whereClause,
        include: {
          participants: {
            include: {
              member: true
            }
          }
        },
        orderBy: [
          {
            createdAt: 'desc'
          },
          {
            date: 'desc'
          }
        ]
      })

      // Transform and apply payment status filter (client-side for unpaginated)
      let transformedGames = games.map((game: any) => ({
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
      }))

      // Apply payment status filter
      if (paymentStatus === 'paid') {
        transformedGames = transformedGames.filter((game: any) => 
          game.participants.every((p: any) => p.hasPaid)
        )
      } else if (paymentStatus === 'unpaid') {
        transformedGames = transformedGames.filter((game: any) => 
          game.participants.some((p: any) => !p.hasPaid)
        )
      }

      return NextResponse.json(transformedGames)
    }

    // Get total count for pagination metadata (with filters applied)
    let totalCount = await prisma.game.count({ where: whereClause })

    // Fetch paginated games with filters
    let games = await prisma.game.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        participants: {
          include: {
            member: true
          }
        }
      },
      orderBy: [
        {
          createdAt: 'desc'
        },
        {
          date: 'desc'
        }
      ]
    })

    // Transform the response
    let transformedGames = games.map((game: any) => ({
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
    }))

    // Apply payment status filter (after fetching but before returning)
    // Note: This is still somewhat client-side, but done server-side
    // For true server-side filtering of payment status, we'd need to use aggregation
    if (paymentStatus === 'paid') {
      transformedGames = transformedGames.filter((game: any) => 
        game.participants.every((p: any) => p.hasPaid)
      )
    } else if (paymentStatus === 'unpaid') {
      transformedGames = transformedGames.filter((game: any) => 
        game.participants.some((p: any) => !p.hasPaid)
      )
    }

    // Recalculate total count if payment status filter was applied
    // This is a workaround - ideally we'd use aggregation for true server-side filtering
    if (paymentStatus !== 'all') {
      // Fetch all games to get accurate count (not ideal, but works)
      const allGames = await prisma.game.findMany({
        where: whereClause,
        include: {
          participants: {
            include: {
              member: true
            }
          }
        }
      })
      
      const allTransformed = allGames.map((game: any) => ({
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
      }))
      
      const filteredByPayment = paymentStatus === 'paid' 
        ? allTransformed.filter((game: any) => game.participants.every((p: any) => p.hasPaid))
        : allTransformed.filter((game: any) => game.participants.some((p: any) => !p.hasPaid))
      
      totalCount = filteredByPayment.length
    }

    // Return paginated response with metadata
    return NextResponse.json({
      data: transformedGames,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page < Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    )
  }
}

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
      memberPrePays = {},
      memberCustomAmounts = {}
    } = body

    // Validate required fields
    if (!date || !location || !memberIds || memberIds.length === 0) {
      return NextResponse.json(
        { error: 'Date, location and at least one member are required' },
        { status: 400 }
      )
    }

    // Create game with participants including pre-pays and custom amounts
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
            prePaid: Number(memberPrePays[memberId]?.amount) || 0,
            prePaidCategory: memberPrePays[memberId]?.category || "",
            customAmount: Number(memberCustomAmounts[memberId]) || 0 // Extra amount on top of equal share
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

    // Transform response to include pre-pay and custom amount data
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