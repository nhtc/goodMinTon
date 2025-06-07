import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')

    if (!name) {
      return NextResponse.json(
        { error: 'Name parameter is required' },
        { status: 400 }
      )
    }

    const existingMember = await prisma.member.findUnique({
      where: { 
        name: name.trim() 
      }
    })

    return NextResponse.json({ 
      exists: !!existingMember,
      name: name.trim()
    })
  } catch (error) {
    console.error('Error checking name:', error)
    return NextResponse.json(
      { error: 'Failed to check name' },
      { status: 500 }
    )
  }
}