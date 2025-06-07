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

// Simple credential check - replace with proper auth in production
export function validateCredentials(username: string, password: string): boolean {
  return username === 'admin' && password === 'password123'
}