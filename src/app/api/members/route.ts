import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const activeOnly = url.searchParams.get('activeOnly') === 'true'
    
    const members = await prisma.member.findMany({
      where: activeOnly ? ({ isActive: true } as any) : undefined,
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received request body:', body)
    
    const { name, phone, avatar, isActive = true } = body

    // Validate required fields
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required and must be a string' },
        { status: 400 }
      )
    }

    // Validate name length
    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters long' },
        { status: 400 }
      )
    }

    // Validate phone if provided
    if (phone && typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'Phone must be a string' },
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

    // Validate isActive if provided
    if (isActive !== undefined && typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean' },
        { status: 400 }
      )
    }

    // Check if member with this name already exists
    const existingMember = await prisma.member.findUnique({
      where: { 
        name: name.trim() 
      }
    })

    if (existingMember) {
      return NextResponse.json(
        { error: `Thành viên với tên "${name.trim()}" đã tồn tại. Vui lòng chọn tên khác.` },
        { status: 409 } // 409 Conflict
      )
    }

    console.log('Creating member with data:', {
      name: name.trim(),
      phone: phone?.trim() || null,
      avatar: avatar?.trim() || null,
      isActive
    })

    // Create new member
    const member = await prisma.member.create({
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        avatar: avatar?.trim() || null,
        isActive
      } as any
    })

    console.log('Member created successfully:', member)
    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('Error creating member:', error)
    
    // Handle Prisma unique constraint error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Tên thành viên đã tồn tại. Vui lòng chọn tên khác.' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { 
        error: 'Failed to create member',
        details: process.env.NODE_ENV === 'development' ?(error instanceof Error ? error.message : 'Unknown error')  : undefined
      },
      { status: 500 }
    )
  }
}