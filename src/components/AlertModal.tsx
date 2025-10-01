import React from 'react'
import { AlertDialog } from './Dialog'

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
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      variant={type}
      title={title}
      message={message}
      showCloseButton={showCloseButton}
      actions={actions.map(action => ({
        ...action,
        type: action.variant || 'primary'
      }))}
    />
  )
}

export default AlertModal
