import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/withAuth"
import { prisma } from "@/lib/prisma"

/**
 * Bulk payment operations for a specific member
 * Handles marking all unpaid games/events as paid or unpaid
 */
async function handleBulkPaymentOperation(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: memberId } = params
    const body = await request.json()
    const { operation, type } = body

    if (!operation || !type) {
      return NextResponse.json(
        { error: "Missing required fields: operation, type" },
        { status: 400 }
      )
    }

    if (!["mark_all_paid", "mark_all_unpaid"].includes(operation)) {
      return NextResponse.json(
        { error: "Invalid operation. Must be 'mark_all_paid' or 'mark_all_unpaid'" },
        { status: 400 }
      )
    }

    if (!["games", "personal_events", "both"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be 'games', 'personal_events', or 'both'" },
        { status: 400 }
      )
    }

    // Verify member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    })

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      )
    }

    const isPaid = operation === "mark_all_paid"
    const paidAt = isPaid ? new Date() : null
    let gamesUpdated = 0
    let personalEventsUpdated = 0

    // Handle games bulk update
    if (type === "games" || type === "both") {
      const gamesResult = await prisma.gameParticipant.updateMany({
        where: {
          memberId: memberId,
          hasPaid: !isPaid // Only update items that need to change
        },
        data: {
          hasPaid: isPaid,
          paidAt: paidAt
        }
      })
      gamesUpdated = gamesResult.count
    }

    // Handle personal events bulk update  
    if (type === "personal_events" || type === "both") {
      const personalEventsResult = await prisma.personalEventParticipant.updateMany({
        where: {
          memberId: memberId,
          hasPaid: !isPaid // Only update items that need to change
        },
        data: {
          hasPaid: isPaid,
          paidAt: paidAt
        }
      })
      personalEventsUpdated = personalEventsResult.count
    }

    return NextResponse.json({
      message: `Successfully ${operation.replace('_', ' ')} for ${member.name}`,
      member: {
        id: member.id,
        name: member.name
      },
      updates: {
        gamesUpdated,
        personalEventsUpdated,
        totalUpdated: gamesUpdated + personalEventsUpdated
      }
    })

  } catch (error) {
    console.error("Bulk payment operation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export const POST = withAuth(handleBulkPaymentOperation)