import { useState, useCallback } from 'react'
import { ToastMessage } from '../components/Toast'

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((
    type: ToastMessage['type'],
    title: string,
    message: string,
    duration?: number
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    const newToast: ToastMessage = {
      id,
      type,
      title,
      message,
      duration
    }

    setToasts(prev => [...prev, newToast])
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  // Convenience methods
  const showSuccess = useCallback((title: string, message: string, duration?: number) => {
    return addToast('success', title, message, duration)
  }, [addToast])

  const showError = useCallback((title: string, message: string, duration?: number) => {
    return addToast('error', title, message, duration || 7000) // Errors stay longer
  }, [addToast])

  const showWarning = useCallback((title: string, message: string, duration?: number) => {
    return addToast('warning', title, message, duration)
  }, [addToast])

  const showInfo = useCallback((title: string, message: string, duration?: number) => {
    return addToast('info', title, message, duration)
  }, [addToast])

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}
