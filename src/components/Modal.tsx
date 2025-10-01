import React from "react"
import { BaseDialog, DialogHeader, DialogBody } from "./Dialog"

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
  // SRP: Extract size configuration for backward compatibility
  const sizeMapping: Record<string, "sm" | "base" | "lg" | "xl" | "full"> = {
    large: "lg",
    xl: "xl",
    default: "base"
  }

  const dialogSize = sizeMapping[size] || sizeMapping.default

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      size={dialogSize}
      disableOverlayClose={disableOverlayClose}
      className={customWidth ? "modal-custom-width" : ""}
    >
      {showHeader && title && (
        <DialogHeader title={title} />
      )}
      
      <DialogBody padding={showHeader ? "base" : "none"}>
        {children}
      </DialogBody>
      
      {/* Add custom width styling using CSS variables */}
      {customWidth && (
        <style dangerouslySetInnerHTML={{
          __html: `
            .modal-custom-width {
              max-width: ${customWidth} !important;
            }
          `
        }} />
      )}
    </BaseDialog>
  )
}

export default Modal
