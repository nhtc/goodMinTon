import React from "react"
import { ConfirmationDialog } from "./Dialog"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: "danger" | "warning" | "info"
  isLoading?: boolean
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  type = "danger",
  isLoading = false,
}) => {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  // Map type to variant for ConfirmationDialog
  const variant = type === "danger" ? "destructive" : "default"

  return (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      title={title}
      description={message}
      confirmText={confirmText}
      cancelText={cancelText}
      onConfirm={onConfirm}
      onCancel={onClose}
      variant={variant}
      loading={isLoading}
    />
  )
}

export default ConfirmationModal
