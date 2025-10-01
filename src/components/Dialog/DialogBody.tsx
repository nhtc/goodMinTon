import React from "react"
import styles from "./DialogBody.module.css"

interface DialogBodyProps {
  children: React.ReactNode
  className?: string
  padding?: "none" | "sm" | "base" | "lg"
  scrollable?: boolean
}

const DialogBody: React.FC<DialogBodyProps> = ({
  children,
  className = "",
  padding = "base",
  scrollable = true,
}) => {
  // SRP: Extract padding configuration
  const paddingClasses = {
    none: styles.bodyNoPadding,
    sm: styles.bodySmallPadding,
    lg: styles.bodyLargePadding,
    base: styles.body
  }

  const paddingClass = paddingClasses[padding] || paddingClasses.base

  const scrollClass = scrollable ? styles.scrollable : styles.noScroll

  return (
    <div className={`${paddingClass} ${scrollClass} ${className}`}>
      {children}
    </div>
  )
}

export default DialogBody