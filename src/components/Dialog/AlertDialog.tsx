import React from "react"
import BaseDialog from "./BaseDialog"
import styles from "./AlertDialog.module.css"

interface AlertAction {
  label: string
  onClick: () => void
  type?: 'primary' | 'secondary' | 'danger'
}

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  message?: string
  children?: React.ReactNode
  actionText?: string
  onAction?: () => void
  variant?: "info" | "success" | "warning" | "error"
  showCloseButton?: boolean
  actions?: AlertAction[]
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  message,
  children,
  actionText = "OK",
  onAction,
  variant = "info",
  showCloseButton = true,
  actions = [],
}) => {
  const handleAction = () => {
    if (onAction) {
      onAction()
    } else {
      onOpenChange(false)
    }
  }

  // DRY: Extract variant configurations to avoid duplication
  const variantConfig = {
    info: {
      iconClass: styles.iconInfo,
      buttonClass: styles.actionButtonInfo,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 16V12M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    },
    success: {
      iconClass: styles.iconSuccess,
      buttonClass: styles.actionButtonSuccess,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 6L9 17L4 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    },
    warning: {
      iconClass: styles.iconWarning,
      buttonClass: styles.actionButtonWarning,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    },
    error: {
      iconClass: styles.iconError,
      buttonClass: styles.actionButtonError,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    }
  }

  const currentVariant = variantConfig[variant] || variantConfig.info

  const getButtonClass = (type: string) => {
    switch (type) {
      case 'primary': return styles.actionButtonPrimary
      case 'secondary': return styles.actionButtonSecondary
      case 'danger': return styles.actionButtonDanger
      default: return currentVariant.buttonClass
    }
  }

  const displayActions = actions.length > 0 ? actions : [{ label: actionText, onClick: handleAction, type: 'primary' }]
  
  return (
    <BaseDialog open={open} onOpenChange={onOpenChange} size="sm">
      <BaseDialog.Body padding="lg">
        <div className={styles.content}>
          <div className={currentVariant.iconClass}>
            {currentVariant.icon}
          </div>
          
          <div className={styles.text}>
            {showCloseButton && (
              <button
                className={styles.closeButton}
                onClick={() => onOpenChange(false)}
                aria-label="Close"
              >
                ✕
              </button>
            )}
            <h3 className={styles.title}>{title}</h3>
            {description && (
              <p className={styles.description}>{description}</p>
            )}
            {message && (
              <p className={styles.description}>{message}</p>
            )}
            {children}
          </div>
        </div>
        
        <div className={styles.actions}>
          {displayActions.map((action, index) => (
            <button
              key={index}
              className={getButtonClass(action.type || 'primary')}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      </BaseDialog.Body>
    </BaseDialog>
  )
}

export default AlertDialog