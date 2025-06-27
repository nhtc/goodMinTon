import { NextRequest } from 'next/server'

// Simple auth for demo purposes - replace with proper auth in production
export const AUTH_COOKIE = 'badminton-auth'

export function isAuthenticated(request: NextRequest): boolean {
  const authCookie = request.cookies.get(AUTH_COOKIE)
  return authCookie?.value === 'authenticated'
}

export function createAuthResponse() {
  const response = new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
  
  response.headers.set('Set-Cookie', `${AUTH_COOKIE}=authenticated; Path=/; HttpOnly; Max-Age=86400`)
  return response
}

export function removeAuthResponse() {
  const response = new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
  
  response.headers.set('Set-Cookie', `${AUTH_COOKIE}=; Path=/; HttpOnly; Max-Age=0`)
  return response
}
// Simple mock users for testing
const MOCK_USERS = [
  { id: '1', username: 'admin', password: 'password123', role: 'admin' },
  { id: '2', username: 'manager', password: 'manager123', role: 'manager' },
  { id: '3', username: 'user', password: 'user123', role: 'user' }
]

export async function validateCredentials(username: string, password: string) {
  // Simple mock validation
  const user = MOCK_USERS.find(
    u => u.username === username && u.password === password
  )
  
  if (user) {
    return {
      id: user.id,
      username: user.username,
      role: user.role
    }
  }
  
  return null
}
