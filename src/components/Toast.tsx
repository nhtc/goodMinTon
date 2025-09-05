import React, { useState, useEffect } from 'react'
import styles from './Toast.module.css'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

interface ToastProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  useEffect(() => {
    toasts.forEach((toast) => {
      if (toast.duration !== 0) { // 0 means persistent
        const timer = setTimeout(() => {
          onRemove(toast.id)
        }, toast.duration || 5000)

        return () => clearTimeout(timer)
      }
    })
  }, [toasts, onRemove])

  const getIcon = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return 'ℹ️'
    }
  }

  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type]}`}
        >
          <div className={styles.toastIcon}>
            {getIcon(toast.type)}
          </div>
          <div className={styles.toastContent}>
            <div className={styles.toastTitle}>{toast.title}</div>
            <div className={styles.toastMessage}>{toast.message}</div>
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            className={styles.toastClose}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

export default Toast
