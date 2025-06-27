import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { validateCredentials } from '../../../../lib/auth'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()
    
    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' }, 
        { status: 400 }
      )
    }

    const user = await validateCredentials(username, password)
    
    if (user) {
      // Create JWT token
      const token = jwt.sign(
        { 
          userId: user.id,
          username: user.username,
          role: user.role || 'user'
        },
        JWT_SECRET as string,
        { 
          expiresIn: '24h'
        }
      )

      // Create response
      // Create response with token included
      const response = NextResponse.json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          role: user.role || 'user'
        },
        token: token // Include token in response for localStorage
      })

      // Set HTTP-only cookie with the token
      response.cookies.set({
        name: 'auth-token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        path: '/'
      })

      // Also set a client-accessible cookie for auth state
      response.cookies.set({
        name: 'auth-state',
        value: 'authenticated',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/'
      })

      return response
    } else {
      return NextResponse.json(
        { message: 'Invalid username or password' }, 
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Login failed'
      },
      { status: 500 }
    )
  }
}

// Logout endpoint
export async function DELETE(req: NextRequest) {
  try {
    const response = NextResponse.json({ 
      message: 'Logout successful' 
    })

    // Clear auth cookies
    response.cookies.set({
      name: 'auth-token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    })

    response.cookies.set({
      name: 'auth-state',
      value: '',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { message: 'Logout failed' },
      { status: 500 }
    )
  }
}