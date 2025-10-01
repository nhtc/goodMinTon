import React from "react"
import styles from "./FormLabel.module.css"

interface FormLabelProps {
  htmlFor?: string
  children: React.ReactNode
  required?: boolean
  icon?: string
  className?: string
}

const FormLabel: React.FC<FormLabelProps> = ({
  htmlFor,
  children,
  required = false,
  icon,
  className = "",
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`${styles.label} ${className}`}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.text}>{children}</span>
      {required && <span className={styles.required}>*</span>}
    </label>
  )
}

export default FormLabel