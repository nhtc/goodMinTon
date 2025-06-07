import { NextRequest, NextResponse } from 'next/server'
import { validateCredentials } from '../../../../lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    const user = await validateCredentials(username, password)

    if (user) {
      // Here you would typically set a session or a token
      return NextResponse.json({ message: 'Login successful', user })
    } else {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Login failed', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Logic for logout can be implemented here
    return NextResponse.json({ message: 'Logout successful' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { message: 'Logout failed' },
      { status: 500 }
    )
  }
}