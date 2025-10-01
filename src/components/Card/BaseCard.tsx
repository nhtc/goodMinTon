import React from "react"
import styles from "./BaseCard.module.css"

interface BaseCardProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "elevated" | "outlined" | "filled"
  padding?: "none" | "sm" | "base" | "lg"
  interactive?: boolean
  onClick?: () => void
}

const BaseCard: React.FC<BaseCardProps> = ({
  children,
  className = "",
  variant = "default",
  padding = "base",
  interactive = false,
  onClick,
}) => {
  // SRP: Extract variant and padding configurations
  const variantClasses = {
    elevated: styles.elevated,
    outlined: styles.outlined,
    filled: styles.filled,
    default: styles.default
  }

  const paddingClasses = {
    none: styles.paddingNone,
    sm: styles.paddingSm,
    lg: styles.paddingLg,
    base: styles.paddingBase
  }

  const variantClass = variantClasses[variant] || variantClasses.default
  const paddingClass = paddingClasses[padding] || paddingClasses.base

  const interactiveClass = interactive ? styles.interactive : ""
  const clickableClass = onClick ? styles.clickable : ""

  return (
    <div
      className={`${styles.card} ${variantClass} ${paddingClass} ${interactiveClass} ${clickableClass} ${className}`}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      } : undefined}
    >
      {children}
    </div>
  )
}

export default BaseCard