const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  try {
    // Clear existing data (optional - remove if you want to keep existing data)
    console.log('🗑️ Clearing existing data...')
    await prisma.personalEventParticipant.deleteMany()
    await prisma.gameParticipant.deleteMany()
    await prisma.personalEvent.deleteMany()
    await prisma.game.deleteMany()
    await prisma.member.deleteMany()

    // Create Members
    console.log('👥 Creating members...')
    const members = await Promise.all([
      prisma.member.create({
        data: {
          name: 'Nguyễn Văn An',
          phone: '0901234567',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          isActive: true,
        },
      }),
      prisma.member.create({
        data: {
          name: 'Trần Thị Bình',
          phone: '0987654321',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b55c?w=150&h=150&fit=crop&crop=face',
          isActive: true,
        },
      }),
      prisma.member.create({
        data: {
          name: 'Lê Hoàng Cường',
          phone: '0912345678',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          isActive: true,
        },
      }),
      prisma.member.create({
        data: {
          name: 'Phạm Thị Dung',
          phone: '0923456789',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          isActive: true,
        },
      }),
      prisma.member.create({
        data: {
          name: 'Hoàng Minh Tuấn',
          phone: '0934567890',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
          isActive: true,
        },
      }),
      prisma.member.create({
        data: {
          name: 'Vũ Thị Lan',
          phone: '0945678901',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
          isActive: true,
        },
      }),
      prisma.member.create({
        data: {
          name: 'Đỗ Văn Minh',
          phone: '0956789012',
          avatar: null, // Some members without avatar
          isActive: true,
        },
      }),
      prisma.member.create({
        data: {
          name: 'Bùi Thị Nga',
          phone: '0967890123',
          avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face',
          isActive: false, // Inactive member
        },
      }),
    ])

    console.log(`✅ Created ${members.length} members`)

    // Create Games
    console.log('🏸 Creating games...')
    const games = []
    
    // Game 1 - Recent game
    const game1 = await prisma.game.create({
      data: {
        date: new Date('2025-09-25T18:00:00'),
        location: 'Sân cầu lông Thanh Xuân',
        yardCost: 200000,
        shuttleCockQuantity: 3,
        shuttleCockPrice: 45000,
        otherFees: 20000,
        totalCost: 355000,
        costPerMember: 59167,
        costPerGame: 118334,
        participants: {
          create: [
            {
              member: { connect: { id: members[0].id } },
              hasPaid: true,
              paidAt: new Date('2025-09-25T20:30:00'),
              prePaid: 20000,
              prePaidCategory: 'Sân cầu lông',
              customAmount: 60000,
            },
            {
              member: { connect: { id: members[1].id } },
              hasPaid: true,
              paidAt: new Date('2025-09-25T21:00:00'),
              prePaid: 0,
              prePaidCategory: '',
              customAmount: 59167,
            },
            {
              member: { connect: { id: members[2].id } },
              hasPaid: false,
              prePaid: 15000,
              prePaidCategory: 'Cầu lông',
              customAmount: 59167,
            },
            {
              member: { connect: { id: members[3].id } },
              hasPaid: true,
              paidAt: new Date('2025-09-26T08:00:00'),
              prePaid: 0,
              prePaidCategory: '',
              customAmount: 59167,
            },
            {
              member: { connect: { id: members[4].id } },
              hasPaid: false,
              prePaid: 0,
              prePaidCategory: '',
              customAmount: 59167,
            },
            {
              member: { connect: { id: members[5].id } },
              hasPaid: true,
              paidAt: new Date('2025-09-25T19:45:00'),
              prePaid: 10000,
              prePaidCategory: 'Khác',
              customAmount: 59167,
            },
          ],
        },
      },
    })
    games.push(game1)

    // Game 2 - Last week
    const game2 = await prisma.game.create({
      data: {
        date: new Date('2025-09-20T19:00:00'),
        location: 'Sân cầu lông Cầu Giấy',
        yardCost: 180000,
        shuttleCockQuantity: 2,
        shuttleCockPrice: 45000,
        otherFees: 15000,
        totalCost: 285000,
        costPerMember: 57000,
        costPerGame: 114000,
        participants: {
          create: [
            {
              member: { connect: { id: members[0].id } },
              hasPaid: true,
              paidAt: new Date('2025-09-20T21:30:00'),
              prePaid: 0,
              prePaidCategory: '',
              customAmount: 57000,
            },
            {
              member: { connect: { id: members[2].id } },
              hasPaid: true,
              paidAt: new Date('2025-09-21T10:00:00'),
              prePaid: 20000,
              prePaidCategory: 'Sân cầu lông',
              customAmount: 57000,
            },
            {
              member: { connect: { id: members[4].id } },
              hasPaid: true,
              paidAt: new Date('2025-09-20T22:00:00'),
              prePaid: 0,
              prePaidCategory: '',
              customAmount: 57000,
            },
            {
              member: { connect: { id: members[5].id } },
              hasPaid: true,
              paidAt: new Date('2025-09-20T20:15:00'),
              prePaid: 15000,
              prePaidCategory: 'Cầu lông',
              customAmount: 57000,
            },
            {
              member: { connect: { id: members[6].id } },
              hasPaid: false,
              prePaid: 0,
              prePaidCategory: '',
              customAmount: 57000,
            },
          ],
        },
      },
    })
    games.push(game2)

    console.log(`✅ Created ${games.length} games`)

    // Create Personal Events
    console.log('🎉 Creating personal events...')
    const personalEvents = []

    // Personal Event 1 - Team Building
    const event1 = await prisma.personalEvent.create({
      data: {
        title: 'Team Building Cuối Năm 2025',
        description: 'Sự kiện team building tại resort Sóc Sơn, bao gồm các hoạt động vui chơi, ăn uống và nghỉ ngơi.',
        date: new Date('2025-12-15T09:00:00'),
        location: 'Resort Sóc Sơn, Hà Nội',
        totalCost: 2400000,
        participants: {
          create: [
            {
              member: { connect: { id: members[0].id } },
              customAmount: 400000,
              hasPaid: true,
              paidAt: new Date('2025-09-26T14:30:00'),
              prePaid: 100000,
              prePaidCategory: 'Team Building',
            },
            {
              member: { connect: { id: members[1].id } },
              customAmount: 400000,
              hasPaid: false,
              prePaid: 150000,
              prePaidCategory: 'Team Building',
            },
            {
              member: { connect: { id: members[2].id } },
              customAmount: 400000,
              hasPaid: true,
              paidAt: new Date('2025-09-25T16:20:00'),
              prePaid: 0,
              prePaidCategory: '',
            },
            {
              member: { connect: { id: members[3].id } },
              customAmount: 400000,
              hasPaid: false,
              prePaid: 50000,
              prePaidCategory: 'Team Building',
            },
            {
              member: { connect: { id: members[4].id } },
              customAmount: 400000,
              hasPaid: false,
              prePaid: 200000,
              prePaidCategory: 'Team Building',
            },
            {
              member: { connect: { id: members[5].id } },
              customAmount: 400000,
              hasPaid: true,
              paidAt: new Date('2025-09-27T09:15:00'),
              prePaid: 80000,
              prePaidCategory: 'Team Building',
            },
          ],
        },
      },
    })
    personalEvents.push(event1)

    // Personal Event 2 - Birthday Party
    const event2 = await prisma.personalEvent.create({
      data: {
        title: 'Sinh Nhật Anh Cường',
        description: 'Tiệc sinh nhật tại nhà hàng, ăn uống và karaoke.',
        date: new Date('2025-10-05T18:30:00'),
        location: 'Nhà hàng Ngon Garden, Hai Bà Trưng',
        totalCost: 1800000,
        participants: {
          create: [
            {
              member: { connect: { id: members[0].id } },
              customAmount: 300000,
              hasPaid: true,
              paidAt: new Date('2025-09-26T11:00:00'),
              prePaid: 0,
              prePaidCategory: '',
            },
            {
              member: { connect: { id: members[1].id } },
              customAmount: 300000,
              hasPaid: false,
              prePaid: 100000,
              prePaidCategory: 'Sinh nhật',
            },
            {
              member: { connect: { id: members[2].id } }, // Birthday boy - no payment needed
              customAmount: 0,
              hasPaid: true,
              paidAt: new Date('2025-09-26T11:00:00'),
              prePaid: 0,
              prePaidCategory: 'Người được mừng',
            },
            {
              member: { connect: { id: members[3].id } },
              customAmount: 300000,
              hasPaid: true,
              paidAt: new Date('2025-09-26T15:30:00'),
              prePaid: 50000,
              prePaidCategory: 'Sinh nhật',
            },
            {
              member: { connect: { id: members[4].id } },
              customAmount: 300000,
              hasPaid: false,
              prePaid: 0,
              prePaidCategory: '',
            },
            {
              member: { connect: { id: members[5].id } },
              customAmount: 300000,
              hasPaid: false,
              prePaid: 75000,
              prePaidCategory: 'Sinh nhật',
            },
            {
              member: { connect: { id: members[6].id } },
              customAmount: 300000,
              hasPaid: true,
              paidAt: new Date('2025-09-27T08:45:00'),
              prePaid: 0,
              prePaidCategory: '',
            },
          ],
        },
      },
    })
    personalEvents.push(event2)

    // Personal Event 3 - Weekend Trip
    const event3 = await prisma.personalEvent.create({
      data: {
        title: 'Du Lịch Sapa Cuối Tuần',
        description: 'Chuyến du lịch 2 ngày 1 đêm tại Sapa, tham quan và trải nghiệm văn hóa địa phương.',
        date: new Date('2025-11-08T07:00:00'),
        location: 'Sapa, Lào Cai',
        totalCost: 3200000,
        participants: {
          create: [
            {
              member: { connect: { id: members[0].id } },
              customAmount: 800000,
              hasPaid: false,
              prePaid: 300000,
              prePaidCategory: 'Du lịch',
            },
            {
              member: { connect: { id: members[1].id } },
              customAmount: 800000,
              hasPaid: false,
              prePaid: 250000,
              prePaidCategory: 'Du lịch',
            },
            {
              member: { connect: { id: members[3].id } },
              customAmount: 800000,
              hasPaid: false,
              prePaid: 400000,
              prePaidCategory: 'Du lịch',
            },
            {
              member: { connect: { id: members[5].id } },
              customAmount: 800000,
              hasPaid: false,
              prePaid: 200000,
              prePaidCategory: 'Du lịch',
            },
          ],
        },
      },
    })
    personalEvents.push(event3)

    // Personal Event 4 - Dinner
    const event4 = await prisma.personalEvent.create({
      data: {
        title: 'Tiệc Tất Niên CLB',
        description: 'Bữa ăn tối cuối năm của câu lạc bộ cầu lông.',
        date: new Date('2025-12-28T19:00:00'),
        location: 'Nhà hàng Thủy Tạ, Hồ Tây',
        totalCost: 1600000,
        participants: {
          create: [
            {
              member: { connect: { id: members[0].id } },
              customAmount: 200000,
              hasPaid: false,
              prePaid: 0,
              prePaidCategory: '',
            },
            {
              member: { connect: { id: members[1].id } },
              customAmount: 200000,
              hasPaid: false,
              prePaid: 0,
              prePaidCategory: '',
            },
            {
              member: { connect: { id: members[2].id } },
              customAmount: 200000,
              hasPaid: false,
              prePaid: 50000,
              prePaidCategory: 'Tất niên',
            },
            {
              member: { connect: { id: members[3].id } },
              customAmount: 200000,
              hasPaid: false,
              prePaid: 0,
              prePaidCategory: '',
            },
            {
              member: { connect: { id: members[4].id } },
              customAmount: 200000,
              hasPaid: false,
              prePaid: 100000,
              prePaidCategory: 'Tất niên',
            },
            {
              member: { connect: { id: members[5].id } },
              customAmount: 200000,
              hasPaid: false,
              prePaid: 0,
              prePaidCategory: '',
            },
            {
              member: { connect: { id: members[6].id } },
              customAmount: 200000,
              hasPaid: false,
              prePaid: 75000,
              prePaidCategory: 'Tất niên',
            },
            {
              member: { connect: { id: members[7].id } },
              customAmount: 200000,
              hasPaid: false,
              prePaid: 0,
              prePaidCategory: '',
            },
          ],
        },
      },
    })
    personalEvents.push(event4)

    console.log(`✅ Created ${personalEvents.length} personal events`)

    // Summary
    console.log('\n🎊 Database seeding completed successfully!')
    console.log('📊 Summary:')
    console.log(`   👥 Members: ${members.length}`)
    console.log(`   🏸 Games: ${games.length}`)
    console.log(`   🎉 Personal Events: ${personalEvents.length}`)
    console.log('\n💡 You can now test your application with realistic data!')
    
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed script failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })