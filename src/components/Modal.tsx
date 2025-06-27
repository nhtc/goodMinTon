import React, { useEffect } from "react"
import styles from "./MemberForm.module.css"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEsc)
      // Prevent body scroll when modal is open and preserve scroll position
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      document.body.style.overflow = "hidden"
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollTop}px`
      document.body.style.width = "100%"
    } else {
      // Restore scroll position
      const scrollTop = parseInt(document.body.style.top || "0") * -1
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      if (scrollTop > 0) {
        window.scrollTo(0, scrollTop)
      }
    }

    return () => {
      document.removeEventListener("keydown", handleEsc)
      // Cleanup on unmount
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className={styles.modalOverlay}
      onClick={e => {
        // Close modal when clicking on overlay (not the content)
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <button
            onClick={onClose}
            className={styles.modalCloseBtn}
            aria-label='Close modal'
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal
