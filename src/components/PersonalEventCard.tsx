"use client"
import React from 'react'
import styles from './PersonalEventCard.module.css'
import type { PersonalEvent, PersonalEventCardProps } from '../types'

const PersonalEventCard: React.FC<PersonalEventCardProps> = ({
  event,
  onClick,
  onPaymentToggle,
  paymentLoading,
  selectedMemberId,
  className = ""
}) => {
  // Calculate payment statistics
  // If selectedMemberId is provided, filter calculations to only that member
  const participantsForCalculation = selectedMemberId 
    ? event.participants.filter(p => p.memberId === selectedMemberId)
    : event.participants
    
  const totalParticipants = event.participants.length
  const paidCount = participantsForCalculation.filter(p => p.hasPaid).length
  const unpaidCount = participantsForCalculation.length - paidCount
  const totalPaid = participantsForCalculation
    .filter(p => p.hasPaid)
    .reduce((sum, p) => sum + (p.customAmount - (p.prePaid || 0)), 0)
  
  // Calculate total expected amount for the filtered participants
  const totalExpected = participantsForCalculation.reduce((sum, p) => sum + (p.customAmount - (p.prePaid || 0)), 0)
  const totalRemaining = selectedMemberId
    ? totalExpected - totalPaid
    : event.totalCost - totalPaid

  // Format date display
  const eventDate = new Date(event.date)
  const day = eventDate.getDate().toString().padStart(2, '0')
  const month = eventDate.toLocaleDateString('vi-VN', { month: 'short' })
  const time = eventDate.toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  })

  // Payment completion percentage
  const paymentPercentage = participantsForCalculation.length > 0 
    ? Math.round((paidCount / participantsForCalculation.length) * 100) 
    : 0

  // Handle payment status click
  const handlePaymentStatusClick = (e: React.MouseEvent, participant: any) => {
    e.stopPropagation() // Prevent card click
    const paymentKey = `${event.id}-${participant.member.id}`
    // Don't allow clicks if this payment toggle is loading
    if (paymentLoading === paymentKey) return
    
    if (onPaymentToggle) {
      onPaymentToggle(event.id, participant.member.id)
    }
  }

  return (
    <div 
      className={`${styles.eventCard} ${className}`}
    >
      {/* Event Header */}
      <div className={styles.eventHeader}>
        <div className={styles.eventDateInfo}>
          <div className={styles.eventDate}>{day}</div>
          <div className={styles.eventMonth}>{month}</div>
        </div>
        <div className={styles.eventTitleInfo}>
          <h3 className={styles.eventTitle}>{event.title}</h3>
          <div className={styles.eventSubtitle}>
            <span className={styles.eventTime}>🕐 {time}</span>
            {event.location && (
              <>
                <span className={styles.separator}>•</span>
                <span className={styles.eventLocation}>📍 {event.location}</span>
              </>
            )}
          </div>
          {event.description && (
            <p className={styles.eventDescription}>{event.description}</p>
          )}
        </div>
      </div>

      {/* Event Stats */}
      <div className={styles.eventStats}>
        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>👥</span>
            <span className={styles.statLabel}>Thành viên:</span>
            <span className={styles.statValue}>{totalParticipants} người</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>💰</span>
            <span className={styles.statLabel}>Tổng chi phí:</span>
            <span className={styles.statValue}>{event.totalCost.toLocaleString("vi-VN")}đ</span>
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className={styles.paymentSection}>
        <div className={styles.paymentHeader}>
          <span className={styles.paymentTitle}>
            <span className={styles.paymentIcon}>💳</span>
            Thanh toán
          </span>
          <div className={styles.paymentProgress}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ '--progress': `${paymentPercentage}%` } as React.CSSProperties}
              />
            </div>
            <span className={styles.progressText}>{paymentPercentage}%</span>
          </div>
        </div>
        
        <div className={styles.paymentSummary}>
          <div className={`${styles.paymentBadge} ${styles.paid} ${paidCount > 0 ? styles.active : ""}`}>
            <span className={styles.badgeIcon}>✅</span>
            <span className={styles.badgeCount}>{paidCount}</span>
            <span className={styles.badgeLabel}>đã trả</span>
          </div>
          <div className={`${styles.paymentBadge} ${styles.unpaid} ${unpaidCount > 0 ? styles.active : ""}`}>
            <span className={styles.badgeIcon}>⏳</span>
            <span className={styles.badgeCount}>{unpaidCount}</span>
            <span className={styles.badgeLabel}>chưa trả</span>
          </div>
        </div>

        <div className={styles.paymentTotals}>
          <div className={styles.totalItem}>
            <span className={styles.totalLabel}>💰 Đã thu:</span>
            <span className={styles.totalValue}>{totalPaid.toLocaleString("vi-VN")}đ</span>
          </div>
          <div className={styles.totalItem}>
            <span className={styles.totalLabel}>⏳ Còn cần thu:</span>
            <span className={styles.totalValue}>{totalRemaining.toLocaleString("vi-VN")}đ</span>
          </div>
        </div>
      </div>

      {/* Participants Preview */}
      <div className={styles.participantsPreview}>
        <div className={styles.participantsHeader}>
          <span className={styles.participantsTitle}>
            <span className={styles.participantsIcon}>👥</span>
            Thành viên tham gia
          </span>
        </div>
        <div className={styles.participantsList}>
          {event.participants.slice(0, 5).map((participant) => (
            <div key={participant.id} className={styles.participantPreview}>
              <div className={styles.participantAvatar}>
                {participant.member.avatar ? (
                  <img 
                    src={participant.member.avatar} 
                    alt={`${participant.member.name}'s avatar`}
                    className={styles.participantAvatarImage}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement
                      if (fallback) fallback.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div 
                  className={`${styles.participantAvatarFallback} ${participant.member.avatar ? styles.hidden : styles.visible}`}
                >
                  {participant.member.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className={styles.participantInfo}>
                <div className={styles.participantName}>{participant.member.name}</div>
                <div className={styles.participantAmount}>
                  {(participant.customAmount - (participant.prePaid || 0)).toLocaleString("vi-VN")}đ
                </div>
              </div>
              <div 
                className={`${styles.participantPaymentStatus} ${participant.hasPaid ? styles.paid : styles.unpaid} ${!onPaymentToggle ? styles.disabled : ''}`}
                onClick={onPaymentToggle ? (e) => handlePaymentStatusClick(e, participant) : undefined}
                style={onPaymentToggle ? { cursor: 'pointer' } : { cursor: 'not-allowed', opacity: 0.6 }}
                title={!onPaymentToggle ? 
                  "Bạn không có quyền thay đổi trạng thái thanh toán" :
                  (participant.hasPaid ? "Nhấn để chuyển sang chưa thanh toán" : "Nhấn để chuyển sang đã thanh toán")
                }
              >
                {(() => {
                  const paymentKey = `${event.id}-${participant.member.id}`
                  const isLoading = paymentLoading === paymentKey
                  
                  if (isLoading) {
                    return <span className={styles.statusIcon} title="Đang xử lý...">⏳</span>
                  }
                  
                  return participant.hasPaid ? (
                    <span className={styles.statusIcon} title="Đã thanh toán">✅</span>
                  ) : (
                    <span className={styles.statusIcon} title="Chưa thanh toán">❌</span>
                  )
                })()}
              </div>
            </div>
          ))}
          {event.participants.length > 5 && (
            <div className={styles.moreParticipants}>
              <span className={styles.moreIcon}>+</span>
              <span className={styles.moreCount}>{event.participants.length - 5}</span>
              <span className={styles.moreLabel}>khác</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className={styles.eventActions}>
        <div 
          className={`${styles.actionPrimary} ${styles.clickable}`}
          onClick={() => onClick(event)}
        >
          <div className={styles.actionBtn}>
            <span className={styles.actionIcon}>👁️</span>
            <span className={styles.actionText}>Xem chi tiết</span>
            <span className={styles.actionArrow}>→</span>
          </div>
        </div>
      </div>

      {/* Hover Effect */}
      <div className={styles.cardGlow}></div>
    </div>
  )
}

export default PersonalEventCard