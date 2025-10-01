"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { 
  getValidToken, 
  clearAuthData, 
  isTokenExpired, 
  isTokenExpiringSoon, 
  getTimeUntilExpiration 
} from "@/lib/tokenManager"

interface User {
  id: string
  username: string
  name: string
  role: "admin" | "editor" | "viewer"
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAuthorized: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  loading: boolean
  tokenExpiring: boolean
  timeUntilExpiration: number | null
  checkTokenExpiration: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [tokenExpiring, setTokenExpiring] = useState(false)
  const [timeUntilExpiration, setTimeUntilExpiration] = useState<number | null>(null)

  // Check if user has edit permissions
  const isAuthorized = user?.role === "admin" || user?.role === "editor"
  const isAuthenticated = !!user

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Call logout API to clear server-side cookies
      await fetch("/api/auth/login", {
        method: "DELETE",
      })
    } catch (error) {
      console.error("Logout API call failed:", error)
    }
    
    // Clear all auth data
    clearAuthData()
    setUser(null)
    setTokenExpiring(false)
    setTimeUntilExpiration(null)
  }, [])

  // Token expiration checking function
  const checkTokenExpiration = useCallback(() => {
    const token = getValidToken()
    
    if (!token) {
      if (user?.id) {
        // Token is expired or invalid, logout user
        setUser(null)
        setTokenExpiring(false)
        setTimeUntilExpiration(null)
        console.log("Token expired, logging out user")
      }
      return
    }

    // Check if token is expiring soon (within 5 minutes)
    const expiringSoon = isTokenExpiringSoon(token, 5)
    setTokenExpiring(expiringSoon || false)

    // Get time until expiration
    const timeRemaining = getTimeUntilExpiration(token)
    setTimeUntilExpiration(timeRemaining)

    // If token is expired, logout immediately
    if (isTokenExpired(token)) {
      logout()
    }
  }, [user?.id, logout])

  useEffect(() => {
    // Check for stored auth token on app load
    const checkAuth = async () => {
      try {
        const token = getValidToken()
        if (token) {
          const response = await fetch("/api/auth/verify", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const userData = await response.json()
            setUser(userData.user)
            // Start token expiration checking
            checkTokenExpiration()
          } else {
            clearAuthData()
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        clearAuthData()
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [checkTokenExpiration])

  // Set up periodic token expiration checking
  useEffect(() => {
    if (!user) return

    // Check token expiration every minute
    const interval = setInterval(() => {
      checkTokenExpiration()
    }, 60000) // 1 minute

    // Also check immediately
    checkTokenExpiration()

    return () => clearInterval(interval)
  }, [user, checkTokenExpiration])

  // Listen for token expiration events from API calls
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log('Received token expiration event')
      logout()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:token-expired', handleTokenExpired)
      
      return () => {
        window.removeEventListener('auth:token-expired', handleTokenExpired)
      }
    }
  }, [logout])

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        localStorage.setItem("auth_token", data.token)
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }



  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAuthorized,
        login,
        logout,
        loading,
        tokenExpiring,
        timeUntilExpiration,
        checkTokenExpiration,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
