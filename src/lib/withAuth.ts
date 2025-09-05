import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

export interface AuthenticatedUser {
  userId: string
  username: string
  role: string
}

export interface AuthenticatedRequest extends NextRequest {
  user: AuthenticatedUser
}

// Higher-order function to wrap route handlers with authentication
export function withAuth<T extends any[]>(
  handler: (request: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      // Check for authentication token
      const authCookie = request.cookies.get('auth-token')
      
      if (!authCookie) {
        return NextResponse.json(
          { error: 'Authentication required. Please login first.' },
          { status: 401 }
        )
      }

      // Verify JWT token
      const decoded = jwt.verify(authCookie.value, JWT_SECRET as string) as AuthenticatedUser
      
      // Add user to request object
      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.user = decoded

      // Call the original handler with authenticated request
      return await handler(authenticatedRequest, ...args)
      
    } catch (error) {
      console.error('Authentication error:', error)
      return NextResponse.json(
        { error: 'Invalid or expired token. Please login again.' },
        { status: 401 }
      )
    }
  }
}

// Optional: Create specific role-based wrappers
export function withAdminAuth<T extends any[]>(
  handler: (request: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return withAuth(async (request: AuthenticatedRequest, ...args: T) => {
    if (request.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required.' },
        { status: 403 }
      )
    }
    return await handler(request, ...args)
  })
}

// Helper function to get user from request (for use in handlers)
export function getUser(request: AuthenticatedRequest): AuthenticatedUser {
  return request.user
}
