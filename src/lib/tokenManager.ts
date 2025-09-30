/**
 * Token Management Utility
 * Handles JWT token operations including validation, expiration checking, and cleanup
 */

interface DecodedToken {
  userId: string
  username: string
  role: string
  iat: number
  exp: number
}

/**
 * Decodes a JWT token without verification (for client-side expiration checking)
 * @param token - JWT token string
 * @returns Decoded token payload or null if invalid
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    // Split token into parts
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    // Decode the payload (second part)
    const payload = parts[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    
    return decoded as DecodedToken
  } catch (error) {
    console.error('Failed to decode token:', error)
    return null
  }
}

/**
 * Checks if a token is expired
 * @param token - JWT token string
 * @returns true if expired, false if valid, null if invalid token
 */
export function isTokenExpired(token: string): boolean | null {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) {
    return null // Invalid token
  }

  const currentTime = Math.floor(Date.now() / 1000)
  return decoded.exp < currentTime
}

/**
 * Gets the expiration time of a token
 * @param token - JWT token string
 * @returns Date object of expiration or null if invalid
 */
export function getTokenExpiration(token: string): Date | null {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) {
    return null
  }
  
  return new Date(decoded.exp * 1000)
}

/**
 * Gets the time remaining until token expiration
 * @param token - JWT token string
 * @returns milliseconds until expiration, negative if expired, null if invalid
 */
export function getTimeUntilExpiration(token: string): number | null {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) {
    return null
  }

  const currentTime = Math.floor(Date.now() / 1000)
  return (decoded.exp - currentTime) * 1000
}

/**
 * Checks if token will expire soon (within specified minutes)
 * @param token - JWT token string
 * @param warningMinutes - Minutes before expiration to warn (default: 5)
 * @returns true if expiring soon, false if not, null if invalid
 */
export function isTokenExpiringSoon(token: string, warningMinutes: number = 5): boolean | null {
  const timeRemaining = getTimeUntilExpiration(token)
  if (timeRemaining === null) {
    return null
  }

  const warningMs = warningMinutes * 60 * 1000
  return timeRemaining < warningMs && timeRemaining > 0
}

/**
 * Clears all authentication data from storage and cookies
 */
export function clearAuthData(): void {
  // Clear localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
    
    // Also clear cookies by setting them to expire
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'auth-state=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }
}

/**
 * Gets token from localStorage with validation
 * @returns Valid token string or null
 */
export function getValidToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  const token = localStorage.getItem('auth_token')
  if (!token) {
    return null
  }

  // Check if token is expired
  const expired = isTokenExpired(token)
  if (expired === true) {
    // Token is expired, clear it
    clearAuthData()
    return null
  }

  if (expired === null) {
    // Token is invalid, clear it
    clearAuthData()
    return null
  }

  return token
}