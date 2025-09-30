"use client"
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/useToast'
import styles from './TokenExpirationWarning.module.css'

/**
 * Component that monitors token expiration and shows warnings to users
 * Automatically logs out users when token expires
 */
const TokenExpirationWarning: React.FC = () => {
  const { tokenExpiring, timeUntilExpiration, logout, isAuthenticated } = useAuth()
  const { addToast } = useToast()
  const [warningShown, setWarningShown] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !tokenExpiring || !timeUntilExpiration) {
      setWarningShown(false)
      return
    }

    // Show warning only once per session when token is expiring
    if (!warningShown && timeUntilExpiration > 0) {
      const minutesLeft = Math.ceil(timeUntilExpiration / (1000 * 60))
      
      addToast('warning', 'Session Expiring Soon', 
        `Your session will expire in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}. Please save your work.`)
      
      setWarningShown(true)
    }

    // Auto-logout when token expires
    if (timeUntilExpiration <= 0) {
      addToast('error', 'Session Expired', 'Your session has expired. Please log in again.')
      logout()
    }
  }, [tokenExpiring, timeUntilExpiration, isAuthenticated, warningShown, addToast, logout])

  // This component doesn't render anything visible
  return null
}

export default TokenExpirationWarning