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

// Type for route handler function - using any to avoid the generic constraint issue
type RouteHandler = (
  request: NextRequest,
  context?: any
) => Promise<NextResponse>

// Higher-order function to wrap route handlers with authentication
export function withAuth(
  handler: RouteHandler
): RouteHandler {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
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
      return await handler(authenticatedRequest, context)
      
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
export function withAdminAuth(
  handler: RouteHandler
): RouteHandler {
  return withAuth(async (request: NextRequest, context?: any) => {
    const user = (request as AuthenticatedRequest).user
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required.' },
        { status: 403 }
      )
    }
    return await handler(request, context)
  })
}

// Helper function to get user from request (for use in handlers)
export function getUser(request: NextRequest): AuthenticatedUser | null {
  return (request as any).user || null
}
