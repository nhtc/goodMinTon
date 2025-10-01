import React from "react"
import BaseDialog from "./BaseDialog"
import * as Dialog from "@radix-ui/react-dialog"
import styles from "./ConfirmationDialog.module.css"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
  variant?: "default" | "destructive"
  loading?: boolean
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
  loading = false,
}) => {
  const handleConfirm = () => {
    if (!loading) {
      onConfirm()
    }
  }

  const handleCancel = () => {
    if (!loading) {
      if (onCancel) {
        onCancel()
      } else {
        onOpenChange(false)
      }
    }
  }

  // SRP: Extract variant configuration
  const variantClasses = {
    destructive: styles.confirmButtonDestructive,
    default: styles.confirmButton
  }

  const confirmButtonClass = variantClasses[variant] || variantClasses.default

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      disableOverlayClose={loading}
    >
      <BaseDialog.Header title={title} description={description} showCloseButton={!loading} />
      
      <BaseDialog.Footer justify="end">
        <Dialog.Close asChild>
          <button
            className={styles.cancelButton}
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
        </Dialog.Close>
        
        <button
          className={confirmButtonClass}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className={styles.spinner} viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="31.416"
                  strokeDashoffset="31.416"
                  fill="none"
                  strokeOpacity="0.25"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="31.416"
                  strokeDashoffset="23.562"
                  fill="none"
                  className={styles.spinnerCircle}
                />
              </svg>
              Loading...
            </>
          ) : (
            confirmText
          )}
        </button>
      </BaseDialog.Footer>
    </BaseDialog>
  )
}

export default ConfirmationDialog