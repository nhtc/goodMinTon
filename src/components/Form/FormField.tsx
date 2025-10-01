import React from "react"
import styles from "./FormField.module.css"

interface FormFieldProps {
  children: React.ReactNode
  className?: string
  error?: string | boolean
}

const FormField: React.FC<FormFieldProps> = ({
  children,
  className = "",
  error,
}) => {
  const hasError = Boolean(error)

  return (
    <div className={`${styles.field} ${hasError ? styles.error : ""} ${className}`}>
      {children}
      {typeof error === "string" && error && (
        <div className={styles.errorMessage}>
          <span className={styles.errorIcon}>😅</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export default FormField