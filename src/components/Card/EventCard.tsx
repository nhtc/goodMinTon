import React from "react"
import BaseCard from "./BaseCard"
import styles from "./EventCard.module.css"

interface EventCardProps {
  title: string
  date: string
  location: string
  totalCost: number
  memberCount: number
  paidCount?: number
  onClick?: () => void
  className?: string
  variant?: "default" | "paid" | "unpaid"
}

const EventCard: React.FC<EventCardProps> = ({
  title,
  date,
  location,
  totalCost,
  memberCount,
  paidCount = 0,
  onClick,
  className = "",
  variant = "default",
}) => {
  // SRP: Extract variant configuration
  const variantClasses = {
    paid: styles.paid,
    unpaid: styles.unpaid,
    default: ""
  }

  const variantClass = variantClasses[variant] || variantClasses.default

  const isCompleted = paidCount === memberCount && memberCount > 0

  return (
    <BaseCard
      interactive={Boolean(onClick)}
      onClick={onClick}
      className={`${styles.eventCard} ${variantClass} ${className}`}
    >
      <div className={styles.header}>
        <div className={styles.dateSection}>
          <div className={styles.dateIcon}>📅</div>
          <div className={styles.dateInfo}>
            <div className={styles.dateText}>{date}</div>
            {isCompleted && <div className={styles.completedBadge}>✅ Hoàn thành</div>}
          </div>
        </div>
        <div className={styles.status}>
          <div className={`${styles.statusIndicator} ${isCompleted ? styles.completed : styles.pending}`}>
            {isCompleted ? "💰" : "⏳"}
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.details}>
          <div className={styles.detail}>
            <span className={styles.detailIcon}>📍</span>
            <span className={styles.detailText}>{location}</span>
          </div>
          <div className={styles.detail}>
            <span className={styles.detailIcon}>👥</span>
            <span className={styles.detailText}>{memberCount} người</span>
          </div>
          <div className={styles.detail}>
            <span className={styles.detailIcon}>💰</span>
            <span className={styles.detailText}>
              {totalCost.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>
      </div>

      {paidCount !== undefined && (
        <div className={styles.footer}>
          <div className={styles.paymentProgress}>
            <div className={styles.progressInfo}>
              <span className={styles.progressText}>
                Đã trả: {paidCount}/{memberCount}
              </span>
              <span className={styles.progressPercent}>
                {memberCount > 0 ? Math.round((paidCount / memberCount) * 100) : 0}%
              </span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={`${styles.progressFill} ${
                  memberCount > 0 && paidCount / memberCount >= 1 ? styles.complete :
                  memberCount > 0 && paidCount / memberCount >= 0.5 ? styles.half :
                  styles.low
                }`}
              />
            </div>
          </div>
        </div>
      )}
    </BaseCard>
  )
}

export default EventCard