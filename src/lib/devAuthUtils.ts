/**
 * Development utilities for testing token expiration
 * Only available in development mode
 */

import { clearAuthData, getValidToken, decodeToken } from './tokenManager'

export const devAuthUtils = {
  /**
   * Force clear all auth data (useful for testing logout)
   */
  forceLogout() {
    if (process.env.NODE_ENV === 'development') {
      clearAuthData()
      window.location.reload()
    }
  },

  /**
   * Get current token info for debugging
   */
  getTokenInfo() {
    if (process.env.NODE_ENV === 'development') {
      const token = getValidToken()
      if (token) {
        const decoded = decodeToken(token)
        return {
          token,
          decoded,
          expiresAt: decoded ? new Date(decoded.exp * 1000) : null,
          isExpired: decoded ? decoded.exp * 1000 < Date.now() : null
        }
      }
      return { token: null }
    }
    return null
  },

  /**
   * Simulate token expiration by clearing token and triggering event
   */
  simulateTokenExpiration() {
    if (process.env.NODE_ENV === 'development') {
      clearAuthData()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:token-expired'))
      }
    }
  }
}

// Make utilities available in browser console during development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  ;(window as any).authUtils = devAuthUtils
}