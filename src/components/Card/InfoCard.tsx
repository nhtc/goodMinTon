import React from "react"
import BaseCard from "./BaseCard"
import styles from "./InfoCard.module.css"

interface InfoCardProps {
  title: string
  description?: string
  children?: React.ReactNode
  icon?: React.ReactNode
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: "primary" | "secondary" | "danger"
  }>
  variant?: "default" | "info" | "success" | "warning" | "error"
  interactive?: boolean
  onClick?: () => void
  className?: string
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  children,
  icon,
  actions = [],
  variant = "default",
  interactive = false,
  onClick,
  className = "",
}) => {
  const getButtonClass = (buttonVariant: string) => {
    switch (buttonVariant) {
      case "primary":
        return styles.actionButtonPrimary
      case "secondary":
        return styles.actionButtonSecondary
      case "danger":
        return styles.actionButtonDanger
      default:
        return styles.actionButtonPrimary
    }
  }

  return (
    <BaseCard
      variant="outlined"
      padding="lg"
      interactive={interactive}
      onClick={onClick}
      className={`${styles.infoCard} ${styles[variant]} ${className}`}
    >
      <div className={styles.header}>
        {icon && <div className={styles.icon}>{icon}</div>}
        <div className={styles.headerContent}>
          <h3 className={styles.title}>{title}</h3>
          {description && <p className={styles.description}>{description}</p>}
        </div>
      </div>
      
      {children && (
        <div className={styles.content}>
          {children}
        </div>
      )}
      
      {actions.length > 0 && (
        <div className={styles.actions}>
          {actions.map((action, index) => (
            <button
              key={index}
              className={getButtonClass(action.variant || "primary")}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </BaseCard>
  )
}

export default InfoCard