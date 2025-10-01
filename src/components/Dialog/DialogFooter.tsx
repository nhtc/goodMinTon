import React from "react"
import styles from "./DialogFooter.module.css"

interface DialogFooterProps {
  children: React.ReactNode
  className?: string
  justify?: "start" | "center" | "end" | "between"
  sticky?: boolean
}

const DialogFooter: React.FC<DialogFooterProps> = ({
  children,
  className = "",
  justify = "end",
  sticky = false,
}) => {
  // SRP: Extract justify configuration
  const justifyClasses = {
    start: styles.justifyStart,
    center: styles.justifyCenter,
    between: styles.justifyBetween,
    end: styles.justifyEnd
  }

  const justifyClass = justifyClasses[justify] || justifyClasses.end

  const stickyClass = sticky ? styles.sticky : ""

  return (
    <div className={`${styles.footer} ${justifyClass} ${stickyClass} ${className}`}>
      {children}
    </div>
  )
}

export default DialogFooter