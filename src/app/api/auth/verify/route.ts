import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

export async function GET(req: NextRequest) {
  try {
    let token: string | undefined

    // Try to get token from Authorization header first
    const authHeader = req.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }

    // If no Bearer token, try to get from HTTP-only cookie
    if (!token) {
      token = req.cookies.get('auth-token')?.value
    }

    if (!token) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      )
    }

    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as any
      
      // Return user information
      return NextResponse.json({
        message: 'Token is valid',
        user: {
          id: decoded.userId,
          username: decoded.username,
          role: decoded.role || 'user'
        }
      })
    } catch (jwtError) {
      // Token is invalid or expired
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Auth verification error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}