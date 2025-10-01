import React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock"
import DialogOverlay from "./DialogOverlay"
import DialogHeader from "./DialogHeader"
import DialogBody from "./DialogBody"
import DialogFooter from "./DialogFooter"
import styles from "./BaseDialog.module.css"

interface BaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  size?: "sm" | "base" | "lg" | "xl" | "full"
  className?: string
  disableOverlayClose?: boolean
  modal?: boolean
}

interface BaseDialogComponent extends React.FC<BaseDialogProps> {
  Header: typeof DialogHeader
  Body: typeof DialogBody
  Footer: typeof DialogFooter
  Overlay: typeof DialogOverlay
}

const BaseDialog: React.FC<BaseDialogProps> = ({
  open,
  onOpenChange,
  children,
  size = "base",
  className = "",
  disableOverlayClose = false,
  modal = true,
}) => {
  // SRP: Delegate scroll management to custom hook
  useBodyScrollLock(open)

  // SRP: Extract size configuration
  const sizeClasses = {
    sm: styles.contentSm,
    lg: styles.contentLg,
    xl: styles.contentXl,
    full: styles.contentFull,
    base: styles.content
  }

  const sizeClass = sizeClasses[size] || sizeClasses.base

  const handleInteractOutside = (event: Event) => {
    if (disableOverlayClose) {
      event.preventDefault()
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal={modal}>
      <Dialog.Portal>
        <DialogOverlay />
        <Dialog.Content
          className={`${sizeClass} ${className}`}
          onInteractOutside={handleInteractOutside}
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Export compound component with sub-components
const BaseDialogComponent = BaseDialog as BaseDialogComponent
BaseDialogComponent.Header = DialogHeader
BaseDialogComponent.Body = DialogBody
BaseDialogComponent.Footer = DialogFooter
BaseDialogComponent.Overlay = DialogOverlay

export default BaseDialogComponent