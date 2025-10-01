import React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import styles from "./DialogOverlay.module.css"

interface DialogOverlayProps {
  className?: string
  blur?: boolean
}

const DialogOverlay: React.FC<DialogOverlayProps> = ({
  className = "",
  blur = true,
}) => {
  const blurClass = blur ? styles.blur : ""

  return (
    <Dialog.Overlay className={`${styles.overlay} ${blurClass} ${className}`} />
  )
}

export default DialogOverlay