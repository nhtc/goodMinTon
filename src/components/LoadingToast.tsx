import React, { useState, useEffect, useRef } from 'react'
import * as Toast from '@radix-ui/react-toast'
import styles from './LoadingToast.module.css'

interface LoadingToastProps {
  open: boolean
  message?: string
  minDuration?: number // Minimum duration in milliseconds (default: 500ms)
}

export const LoadingToast: React.FC<LoadingToastProps> = ({ 
  open, 
  message = 'Đang tìm kiếm...',
  minDuration = 500
}) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const openTimeRef = useRef<number | null>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (open) {
      // When opening, track the time and show immediately
      openTimeRef.current = Date.now()
      setInternalOpen(true)
      
      // Clear any pending close timeout
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
    } else if (openTimeRef.current !== null) {
      // When closing, ensure minimum duration has passed
      const elapsed = Date.now() - openTimeRef.current
      const remainingTime = Math.max(0, minDuration - elapsed)
      
      closeTimeoutRef.current = setTimeout(() => {
        setInternalOpen(false)
        openTimeRef.current = null
        closeTimeoutRef.current = null
      }, remainingTime)
    } else {
      // If never opened, just close immediately
      setInternalOpen(false)
    }

    // Cleanup on unmount
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [open, minDuration])

  return (
    <Toast.Provider swipeDirection="right">
      <Toast.Root className={styles.toastRoot} open={internalOpen} duration={Infinity}>
        <div className={styles.toastContent}>
          <div className={styles.spinner}></div>
          <Toast.Description className={styles.toastDescription}>
            {message}
          </Toast.Description>
        </div>
      </Toast.Root>
      <Toast.Viewport className={styles.toastViewport} />
    </Toast.Provider>
  )
}
