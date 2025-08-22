import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// GET - Get a specific member by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params

    const member = await prisma.member.findUnique({
      where: { id }
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error fetching member:', error)
    return NextResponse.json(
      { error: 'Failed to fetch member' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a member by ID
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params

    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { id }
    })

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Check if member is in any games
    const participantCount = await prisma.gameParticipant.count({
      where: { memberId: id }
    })

    if (participantCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete member', 
          message: `Cannot delete ${existingMember.name} because they have participated in ${participantCount} game(s). Please remove them from all games first.`,
          gameCount: participantCount
        },
        { status: 400 }
      )
    }

    // Delete the member
    await prisma.member.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Member deleted successfully',
      deletedMember: existingMember 
    })
  } catch (error) {
    console.error('Error deleting member:', error)
    return NextResponse.json(
      { error: 'Failed to delete member' },
      { status: 500 }
    )
  }
}

// PUT - Update a member by ID
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params
    const body = await request.json()
    const { name, email, phone, avatar, isActive } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    // Validate avatar if provided
    if (avatar && typeof avatar !== 'string') {
      return NextResponse.json(
        { error: 'Avatar must be a string URL or data URL' },
        { status: 400 }
      )
    }

    // Validate avatar size if it's a data URL (base64)
    if (avatar && avatar.startsWith('data:')) {
      // Check if base64 data is reasonable size (max 1MB)
      if (avatar.length > 1024 * 1024) {
        return NextResponse.json(
          { error: 'Avatar image is too large. Please use a smaller image.' },
          { status: 400 }
        )
      }
    }

    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { id }
    })

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      name: name?.trim() || existingMember.name,
      phone: phone?.trim() || existingMember.phone,
      avatar: avatar?.trim() || (existingMember as any).avatar
    }

    // Only update isActive if explicitly provided
    if (isActive !== undefined) {
      updateData.isActive = isActive
    }

    // Update the member
    const updatedMember = await prisma.member.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error('Error updating member:', error)
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    )
  }
}