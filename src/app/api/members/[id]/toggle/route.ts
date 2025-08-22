import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

// PATCH - Toggle member active status
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { id }
    }) as any

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Toggle the active status
    const updatedMember = await prisma.member.update({
      where: { id },
      data: {
        isActive: !existingMember.isActive
      } as any
    }) as any

    return NextResponse.json({
      message: `Member ${updatedMember.isActive ? 'activated' : 'deactivated'} successfully`,
      member: updatedMember
    })
  } catch (error) {
    console.error('Error toggling member status:', error)
    return NextResponse.json(
      { error: 'Failed to toggle member status' },
      { status: 500 }
    )
  }
}
