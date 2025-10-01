import React, { forwardRef } from "react"
import styles from "./FormInput.module.css"

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
  prefix?: string
  suffix?: string
  variant?: "default" | "money" | "friendly"
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({
  hasError = false,
  prefix,
  suffix,
  variant = "default",
  className = "",
  ...props
}, ref) => {
  // SRP: Extract variant configuration
  const variantClasses = {
    money: styles.money,
    friendly: styles.friendly,
    default: ""
  }

  const variantClass = variantClasses[variant] || variantClasses.default

  const hasWrapper = prefix || suffix

  if (!hasWrapper) {
    return (
      <input
        ref={ref}
        className={`${styles.input} ${variantClass} ${hasError ? styles.error : ""} ${className}`}
        {...props}
      />
    )
  }

  return (
    <div className={`${styles.wrapper} ${variantClass} ${hasError ? styles.wrapperError : ""}`}>
      {prefix && <div className={styles.prefix}>{prefix}</div>}
      <input
        ref={ref}
        className={`${styles.inputWithWrapper} ${variantClass} ${hasError ? styles.error : ""} ${className}`}
        {...props}
      />
      {suffix && <div className={styles.suffix}>{suffix}</div>}
      <div className={styles.glow}></div>
    </div>
  )
})

FormInput.displayName = "FormInput"

export default FormInput