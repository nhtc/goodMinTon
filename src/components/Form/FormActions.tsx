import React from "react"
import styles from "./FormActions.module.css"

interface FormActionsProps {
  children: React.ReactNode
  justify?: "start" | "center" | "end" | "between"
  className?: string
  sticky?: boolean
}

const FormActions: React.FC<FormActionsProps> = ({
  children,
  justify = "end",
  className = "",
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
    <div className={`${styles.actions} ${justifyClass} ${stickyClass} ${className}`}>
      {children}
    </div>
  )
}

export default FormActions