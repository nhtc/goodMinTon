import React from "react"
import Modal from "./Modal"
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

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} showHeader={false}>
      <div className={styles.confirmationModal}>
        {/* Icon */}
        <div className={`${styles.icon} ${styles[type]}`}>
          {type === "danger" && "⚠️"}
          {type === "warning" && "🚨"}
          {type === "info" && "ℹ️"}
        </div>

        {/* Content */}
        <div className={styles.content}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.message}>{message}</p>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            onClick={handleCancel}
            className={`${styles.button} ${styles.cancelButton}`}
            disabled={isLoading}
          >
            <span className={styles.buttonIcon}>❌</span>
            <span>{cancelText}</span>
          </button>
          
          <button
            onClick={handleConfirm}
            className={`${styles.button} ${styles.confirmButton} ${styles[type]}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className={styles.spinner}></div>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <span className={styles.buttonIcon}>
                  {type === "danger" ? "🗑️" : "✅"}
                </span>
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmationModal
