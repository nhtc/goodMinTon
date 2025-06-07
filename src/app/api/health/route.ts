import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    console.log('🔍 Testing database connection...')
    console.log('Database URL:', process.env.DATABASE_URL?.substring(0, 20) + '...')
    
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Try a simple query
    const memberCount = await prisma.member.count()
    console.log(`📊 Found ${memberCount} members in database`)
    
    await prisma.$disconnect()
    
    return NextResponse.json({ 
      status: 'healthy',
      database: 'connected',
      memberCount,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Health check failed:', error)
    
    return NextResponse.json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}