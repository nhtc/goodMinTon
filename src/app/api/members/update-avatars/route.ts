import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getConsistentAvatar } from '../../../../utils/avatar'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting avatar update for existing members...')
    
    // Get all members without avatars
    const members = await prisma.member.findMany({
      where: {
        OR: [
          { avatar: null } as any,
          { avatar: '' } as any
        ]
      }
    })

    console.log(`📋 Found ${members.length} members without avatars`)

    const updatedMembers = []
    
    for (const member of members) {
      const avatarUrl = getConsistentAvatar(member.name)
      
      const updatedMember = await prisma.member.update({
        where: { id: member.id },
        data: { avatar: avatarUrl } as any
      })
      
      updatedMembers.push({
        id: member.id,
        name: member.name,
        avatar: avatarUrl
      })
      
      console.log(`✅ Updated avatar for ${member.name}`)
    }

    console.log(`🎉 Successfully updated ${members.length} members with avatars!`)
    
    return NextResponse.json({
      success: true,
      message: `Successfully updated ${members.length} members with avatars`,
      updatedMembers
    })
    
  } catch (error) {
    console.error('❌ Error updating member avatars:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update member avatars',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
