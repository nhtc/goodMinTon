import React, { useEffect } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import styles from "./Modal.module.css"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  showHeader?: boolean
  size?: "default" | "large" | "xl"
  customWidth?: string
  disableOverlayClose?: boolean
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  showHeader = true,
  size = "default",
  customWidth,
  disableOverlayClose = false,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = "100%"
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0", 10) * -1)
      }
    }

    // Cleanup function
    return () => {
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
    }
  }, [isOpen])

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  const handleInteractOutside = (event: Event) => {
    if (disableOverlayClose) {
      event.preventDefault()
    }
  }

  // Get modal size class
  const getSizeClass = () => {
    switch (size) {
      case "large":
        return styles.contentLarge
      case "xl":
        return styles.contentXL
      default:
        return styles.content
    }
  }

  // Custom inline styles if customWidth is provided
  const customStyles = customWidth ? { maxWidth: customWidth } : {}

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content 
          className={getSizeClass()} 
          style={customStyles}
          onInteractOutside={handleInteractOutside}
        >
          {/* Always render close button outside of scrollable content */}
          <Dialog.Close asChild>
            <button
              className={styles.floatingCloseButton}
              aria-label='Close modal'
            >
              ✕
            </button>
          </Dialog.Close>

          {showHeader && (
            <div className={styles.header}>
              {title && (
                <Dialog.Title className={styles.title}>{title}</Dialog.Title>
              )}
            </div>
          )}

          <div className={showHeader ? styles.body : styles.bodyFullHeight}>
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default Modal
