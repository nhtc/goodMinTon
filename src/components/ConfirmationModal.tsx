"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { cn } from "../lib/utils"
import styles from "./ConfirmationModal.module.css"

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
  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm()
    }
  }

  const handleCancel = () => {
    if (!isLoading) {
      onClose()
    }
  }

  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case "danger":
        return "⚠️"
      case "warning":
        return "🚨"
      case "info":
        return "ℹ️"
      default:
        return "⚠️"
    }
  }

  // Get confirm button icon
  const getConfirmIcon = () => {
    return type === "danger" ? "🗑️" : "✅"
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent 
        className="sm:max-w-[425px] p-0 gap-0 overflow-hidden"
        onPointerDownOutside={(e) => {
          if (isLoading) {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isLoading) {
            e.preventDefault()
          }
        }}
      >
        <div className={styles.confirmationModal}>
          {/* Icon */}
          <div className={cn(styles.icon, styles[type])}>
            {getIcon()}
          </div>

          {/* Content */}
          <DialogHeader className={styles.content}>
            <DialogTitle className={styles.title}>
              {title}
            </DialogTitle>
            <DialogDescription className={styles.message}>
              {message}
            </DialogDescription>
          </DialogHeader>

          {/* Actions */}
          <DialogFooter className={styles.actions}>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className={cn(styles.button, styles.cancelButton)}
            >
              <span className={styles.buttonIcon}>❌</span>
              <span>{cancelText}</span>
            </Button>
            
            <Button
              type="button"
              variant={type === "danger" ? "destructive" : type === "info" ? "default" : "default"}
              onClick={handleConfirm}
              disabled={isLoading}
              className={cn(styles.button, styles.confirmButton, styles[type])}
            >
              {isLoading ? (
                <>
                  <div className={styles.spinner}></div>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span className={styles.buttonIcon}>
                    {getConfirmIcon()}
                  </span>
                  <span>{confirmText}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmationModal
