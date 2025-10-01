import React from "react"
import styles from "./FormMessage.module.css"

interface FormMessageProps {
  children: React.ReactNode
  variant?: "info" | "success" | "warning" | "error"
  className?: string
}

const FormMessage: React.FC<FormMessageProps> = ({
  children,
  variant = "info",
  className = "",
}) => {
  // DRY: Extract variant configuration to avoid duplication
  const variantConfig = {
    info: { class: styles.info, icon: "ℹ️" },
    success: { class: styles.success, icon: "✅" },
    warning: { class: styles.warning, icon: "⚠️" },
    error: { class: styles.error, icon: "❌" }
  }

  const currentVariant = variantConfig[variant] || variantConfig.info

  return (
    <div className={`${styles.message} ${currentVariant.class} ${className}`}>
      <span className={styles.icon}>{currentVariant.icon}</span>
      <span className={styles.text}>{children}</span>
    </div>
  )
}

export default FormMessage