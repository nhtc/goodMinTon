import React from 'react'
import styles from './AlertModal.module.css'

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  showCloseButton?: boolean
  actions?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'danger'
  }[]
}

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  showCloseButton = true,
  actions = []
}) => {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return 'ℹ️'
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={`${styles.modal} ${styles[type]}`}>
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <span className={styles.icon}>{getIcon()}</span>
          </div>
          <h3 className={styles.title}>{title}</h3>
          {showCloseButton && (
            <button
              onClick={onClose}
              className={styles.closeButton}
            >
              ✕
            </button>
          )}
        </div>
        
        <div className={styles.content}>
          <p className={styles.message}>{message}</p>
        </div>
        
        <div className={styles.actions}>
          {actions.length > 0 ? (
            actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`${styles.actionButton} ${styles[action.variant || 'primary']}`}
              >
                {action.label}
              </button>
            ))
          ) : (
            <button
              onClick={onClose}
              className={`${styles.actionButton} ${styles.primary}`}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AlertModal
