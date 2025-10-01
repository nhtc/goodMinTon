import React from "react"
import BaseCard from "./BaseCard"
import styles from "./StatCard.module.css"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    label: string
    direction: "up" | "down" | "neutral"
  }
  color?: "primary" | "success" | "warning" | "error" | "info"
  interactive?: boolean
  onClick?: () => void
  className?: string
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "primary",
  interactive = false,
  onClick,
  className = "",
}) => {
  const getTrendIcon = (direction: "up" | "down" | "neutral") => {
    switch (direction) {
      case "up":
        return "↗️"
      case "down":
        return "↘️"
      case "neutral":
        return "➡️"
      default:
        return "➡️"
    }
  }

  const getTrendClass = (direction: "up" | "down" | "neutral") => {
    switch (direction) {
      case "up":
        return styles.trendUp
      case "down":
        return styles.trendDown
      case "neutral":
        return styles.trendNeutral
      default:
        return styles.trendNeutral
    }
  }

  return (
    <BaseCard
      variant="elevated"
      padding="lg"
      interactive={interactive}
      onClick={onClick}
      className={`${styles.statCard} ${styles[color]} ${className}`}
    >
      <div className={styles.header}>
        {icon && <div className={styles.icon}>{icon}</div>}
        <h3 className={styles.title}>{title}</h3>
      </div>
      
      <div className={styles.content}>
        <div className={styles.value}>{value}</div>
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      </div>
      
      {trend && (
        <div className={styles.trend}>
          <span className={`${styles.trendValue} ${getTrendClass(trend.direction)}`}>
            {getTrendIcon(trend.direction)} {trend.value > 0 ? '+' : ''}{trend.value}%
          </span>
          <span className={styles.trendLabel}>{trend.label}</span>
        </div>
      )}
    </BaseCard>
  )
}

export default StatCard