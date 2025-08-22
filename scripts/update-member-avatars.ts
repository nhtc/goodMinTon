// Script to update existing members with avatar URLs
import { PrismaClient } from '@prisma/client'
import { getConsistentAvatar } from '../src/utils/avatar'

const prisma = new PrismaClient()

async function updateMembersWithAvatars() {
  try {
    console.log('🚀 Starting avatar update for existing members...')
    
    // Get all members without avatars
    const members = await prisma.member.findMany({
      where: {
        OR: [
          { avatar: null },
          { avatar: '' }
        ]
      }
    })

    console.log(`📋 Found ${members.length} members without avatars`)

    for (const member of members) {
      const avatarUrl = getConsistentAvatar(member.name)
      
      await prisma.member.update({
        where: { id: member.id },
        data: { avatar: avatarUrl }
      })
      
      console.log(`✅ Updated avatar for ${member.name}`)
    }

    console.log(`🎉 Successfully updated ${members.length} members with avatars!`)
  } catch (error) {
    console.error('❌ Error updating member avatars:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
updateMembersWithAvatars()
