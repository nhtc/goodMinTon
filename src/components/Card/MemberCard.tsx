import React from "react"
import BaseCard from "./BaseCard"
import styles from "./MemberCard.module.css"

interface MemberCardProps {
  member: {
    id: string
    name: string
    phone?: string
    avatar?: string
    isActive?: boolean
  }
  showStatus?: boolean
  interactive?: boolean
  onClick?: () => void
  className?: string
}

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  showStatus = true,
  interactive = false,
  onClick,
  className = "",
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <BaseCard
      variant="outlined"
      padding="base"
      interactive={interactive}
      onClick={onClick}
      className={`${styles.memberCard} ${className}`}
    >
      <div className={styles.memberInfo}>
        <div className={styles.avatar}>
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.name}
              className={styles.avatarImage}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {getInitials(member.name)}
            </div>
          )}
        </div>
        
        <div className={styles.details}>
          <h3 className={styles.name}>{member.name}</h3>
          {member.phone && (
            <p className={styles.phone}>{member.phone}</p>
          )}
          {showStatus && (
            <div className={styles.status}>
              <span className={`${styles.statusDot} ${member.isActive ? styles.active : styles.inactive}`}></span>
              <span className={styles.statusText}>
                {member.isActive ? "Hoạt động" : "Không hoạt động"}
              </span>
            </div>
          )}
        </div>
      </div>
    </BaseCard>
  )
}

export default MemberCard