'use client'
import React, { useState } from 'react'
import Modal from './Modal'
import ConfirmationModal from './ConfirmationModal'
import PersonalEventForm from './PersonalEventForm'
import { AuthorizedComponent } from './AuthorizedComponent'
import styles from './PersonalEventDetailsModal.module.css'
import type { 
  PersonalEvent, 
  PersonalEventModalProps, 
  Member,
  UpdatePersonalEventData,
  CreatePersonalEventData 
} from '../types'

// Constants for better maintainability
const PAYMENT_TOGGLE_TIMEOUT = 1000 // milliseconds

const PersonalEventDetailsModal: React.FC<PersonalEventModalProps> = ({
  isOpen,
  onClose,
  event,
  mode = 'view',
  onSave,
  onDelete
}) => {
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null)

  if (!isOpen) return null

  // Handle form submission
  const handleFormSubmit = async (data: CreatePersonalEventData | UpdatePersonalEventData) => {
    if (!onSave) return
    
    setIsSubmitting(true)
    try {
      await onSave(data)
      setShowEditForm(false)
    } catch (error) {
      console.error('Error saving event:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!event?.id || !onDelete) return
    
    try {
      await onDelete(event.id)
      setShowDeleteConfirm(false)
      onClose()
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  /**
   * Handles payment status toggle for a participant
   * @param eventId - ID of the personal event
   * @param memberId - ID of the member to toggle payment for
   */
  const handlePaymentToggle = async (eventId: string, memberId: string): Promise<void> => {
    const paymentKey = `${eventId}-${memberId}`
    setPaymentLoading(paymentKey)
    
    try {
      // This would call an API to toggle payment status
      // For now, just simulate loading
      await new Promise(resolve => setTimeout(resolve, PAYMENT_TOGGLE_TIMEOUT))
      console.log('Toggle payment for:', { eventId, memberId })
    } catch (error) {
      console.error('Error toggling payment:', error)
    } finally {
      setPaymentLoading(null)
    }
  }

  /**
   * Formats date to Vietnamese locale format
   * @param dateString - ISO date string to format
   * @returns Formatted date string
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  /**
   * Formats time to Vietnamese locale format
   * @param dateString - ISO date string to format
   * @returns Formatted time string
   */
  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  /**
   * Calculates payment statistics for the event
   * @param event - The personal event to calculate statistics for
   * @returns Object containing payment statistics
   */
  const calculatePaymentStats = (event: PersonalEvent | undefined) => {
    if (!event?.participants) {
      return {
        totalPaid: 0,
        totalUnpaid: 0,
        totalCollected: 0,
        totalRemaining: 0
      }
    }

    const totalPaid = event.participants.filter(p => p.hasPaid).length
    const totalUnpaid = event.participants.length - totalPaid
    const totalCollected = event.participants
      .filter(p => p.hasPaid)
      .reduce((sum, p) => sum + p.customAmount, 0)
    const totalRemaining = event.totalCost - totalCollected

    return {
      totalPaid,
      totalUnpaid,
      totalCollected,
      totalRemaining
    }
  }

  // Calculate totals using the extracted function
  const paymentStats = calculatePaymentStats(event)  // Calculate totals
  const totalPaid = event?.participants?.filter(p => p.hasPaid).length || 0
  const totalUnpaid = (event?.participants?.length || 0) - totalPaid
  const totalCollected = event?.participants
    ?.filter(p => p.hasPaid)
    .reduce((sum, p) => sum + p.customAmount, 0) || 0
  const totalRemaining = (event?.totalCost || 0) - totalCollected

  // If showing edit form
  if (showEditForm && event) {
    return (
      <Modal 
        isOpen={isOpen} 
        onClose={() => setShowEditForm(false)}
        title="Chỉnh sửa sự kiện"
        size="large"
      >
        <PersonalEventForm
          members={[]} // You would pass actual members from parent
          onSubmit={handleFormSubmit}
          initialData={event}
          isEditing={true}
          isSubmitting={isSubmitting}
        />
      </Modal>
    )
  }

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="large"
        title={event?.title}
      >
        <div className={styles.modalContent}>
          {/* Event Header */}
          <div className={styles.eventHeader}>
            <div className={styles.headerInfo}>
              <div className={styles.eventIcon}>🎉</div>
              <div className={styles.eventDetails}>
                <h2 className={styles.eventTitle}>{event?.title}</h2>
                <div className={styles.eventMeta}>
                  <span className={styles.eventDate}>
                    📅 {event?.date && formatDate(event.date)}
                  </span>
                  {event?.location && (
                    <span className={styles.eventLocation}>
                      📍 {event.location}
                    </span>
                  )}
                </div>
                {event?.description && (
                  <p className={styles.eventDescription}>{event.description}</p>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <AuthorizedComponent 
              requireEdit={true}
              viewOnlyFallback={
                <div className={styles.viewOnlyBadge}>
                  <span className={styles.viewOnlyIcon}>👁️</span>
                  <span>Chỉ xem</span>
                </div>
              }
            >
              <div className={styles.headerActions}>
                <button
                  onClick={() => setShowEditForm(true)}
                  className={`${styles.actionBtn} ${styles.editBtn}`}
                  title="Chỉnh sửa sự kiện"
                >
                  <span className={styles.btnIcon}>✏️</span>
                  <span>Sửa</span>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  title="Xóa sự kiện"
                >
                  <span className={styles.btnIcon}>🗑️</span>
                  <span>Xóa</span>
                </button>
              </div>
            </AuthorizedComponent>
          </div>

          {/* Cost Summary */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>💰</span>
              Chi Phí Chi Tiết
            </h3>
            <div className={styles.costSummary}>
              <div className={styles.costItem}>
                <span className={styles.costLabel}>💰 Tổng chi phí:</span>
                <span className={styles.costValue}>
                  {event?.totalCost?.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div className={styles.costItem}>
                <span className={styles.costLabel}>👥 Số người tham gia:</span>
                <span className={styles.costValue}>{event?.participants?.length || 0} người</span>
              </div>
              <div className={styles.costItem}>
                <span className={styles.costLabel}>💳 Chi phí trung bình/người:</span>
                <span className={styles.costValue}>
                  {event?.totalCost && event?.participants?.length 
                    ? Math.round(event.totalCost / event.participants.length).toLocaleString("vi-VN")
                    : 0
                  }đ
                </span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📊</span>
              Tình Hình Thanh Toán
            </h3>
            <div className={styles.paymentSummary}>
              <div className={styles.paymentStats}>
                <div className={`${styles.paymentStat} ${styles.paid}`}>
                  <span className={styles.statIcon}>✅</span>
                  <div className={styles.statInfo}>
                    <span className={styles.statNumber}>{paymentStats.totalPaid}</span>
                    <span className={styles.statLabel}>đã trả</span>
                  </div>
                </div>
                <div className={`${styles.paymentStat} ${styles.unpaid}`}>
                  <span className={styles.statIcon}>⏳</span>
                  <div className={styles.statInfo}>
                    <span className={styles.statNumber}>{paymentStats.totalUnpaid}</span>
                    <span className={styles.statLabel}>chưa trả</span>
                  </div>
                </div>
                <div className={`${styles.paymentStat} ${styles.total}`}>
                  <span className={styles.statIcon}>💰</span>
                  <div className={styles.statInfo}>
                    <span className={styles.statNumber}>{paymentStats.totalCollected.toLocaleString("vi-VN")}đ</span>
                    <span className={styles.statLabel}>đã thu</span>
                  </div>
                </div>
                <div className={`${styles.paymentStat} ${styles.remaining}`}>
                  <span className={styles.statIcon}>⏳</span>
                  <div className={styles.statInfo}>
                    <span className={styles.statNumber}>{paymentStats.totalRemaining.toLocaleString("vi-VN")}đ</span>
                    <span className={styles.statLabel}>còn cần thu</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Participants List */}
          <div className={styles.section}>
            <div className={styles.participantsHeader}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>👥</span>
                Thành Viên Tham Gia ({event?.participants?.length || 0})
              </h3>
              
              {/* Pay All Button */}
              <AuthorizedComponent 
                requireEdit={true}
                viewOnlyFallback={null}
              >
                {event && event.participants && event.participants.some(p => !p.hasPaid) && (
                  <a
                    href={`/payment?personalEventId=${event.id}&payAll=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.payAllBtn}
                    title="Tạo mã QR thanh toán cho tất cả thành viên chưa trả"
                  >
                    <span className={styles.payAllIcon}>💳</span>
                    <span className={styles.payAllText}>QR Thanh Toán Tập Thể</span>
                  </a>
                )}
              </AuthorizedComponent>
            </div>
            <div className={styles.participantsList}>
              {event?.participants?.map((participant) => {
                const paymentKey = `${event.id}-${participant.memberId}`
                const isLoading = paymentLoading === paymentKey
                
                return (
                  <div
                    key={participant.id}
                    className={`${styles.participantItem} ${
                      participant.hasPaid ? styles.paid : styles.unpaid
                    }`}
                  >
                    {/* Participant Info */}
                    <div className={styles.participantInfo}>
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
                      
                      <div className={styles.participantDetails}>
                        <div className={styles.participantName}>{participant.member.name}</div>
                        {participant.member.phone && (
                          <div className={styles.participantPhone}>📱 {participant.member.phone}</div>
                        )}
                        <div className={styles.participantAmount}>
                          💰 Số tiền: <strong>{participant.customAmount.toLocaleString("vi-VN")}đ</strong>
                        </div>
                        {participant.hasPaid && participant.paidAt && (
                          <div className={styles.participantPaidTime}>
                            ✅ Đã trả lúc {formatTime(participant.paidAt)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Toggle */}
                    <AuthorizedComponent
                      requireEdit={true}
                      viewOnlyFallback={
                        <div className={styles.paymentStatusView}>
                          <div className={`${styles.statusBadge} ${participant.hasPaid ? styles.paid : styles.unpaid}`}>
                            <span className={styles.statusIcon}>
                              {participant.hasPaid ? '✅' : '⏳'}
                            </span>
                            <span className={styles.statusText}>
                              {participant.hasPaid ? 'Đã trả' : 'Chưa trả'}
                            </span>
                          </div>
                          <div className={styles.viewOnlyNote}>👁️ Chỉ xem</div>
                        </div>
                      }
                    >
                      <div className={styles.paymentActions}>
                        <button
                          onClick={() => event && handlePaymentToggle(event.id, participant.memberId)}
                          disabled={isLoading}
                          className={`${styles.paymentToggleBtn} ${
                            participant.hasPaid ? styles.paid : styles.unpaid
                          }`}
                          title={
                            participant.hasPaid
                              ? `✅ ${participant.member.name} đã thanh toán - Nhấn để hủy`
                              : `💰 ${participant.member.name} chưa thanh toán - Nhấn để xác nhận đã trả`
                          }
                        >
                          {isLoading ? (
                            <div className={styles.paymentSpinner}></div>
                          ) : (
                            <>
                              <span className={styles.paymentIcon}>
                                {participant.hasPaid ? '✅' : '⏳'}
                              </span>
                              <span className={styles.paymentText}>
                                {participant.hasPaid ? 'Đã trả' : 'Chưa trả'}
                              </span>
                            </>
                          )}
                        </button>
                        
                        {/* QR Payment Button */}
                        {!participant.hasPaid && (
                          <a
                            href={`/payment?personalEventId=${event?.id}&participantId=${participant.memberId}&amount=${participant.customAmount}&memberName=${encodeURIComponent(participant.member.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.qrPaymentBtn}
                            title={`Tạo mã QR thanh toán cho ${participant.member.name}`}
                          >
                            <span className={styles.qrIcon}>📱</span>
                            <span className={styles.qrText}>QR Code</span>
                          </a>
                        )}
                      </div>
                    </AuthorizedComponent>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Event Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>ℹ️</span>
              Thông Tin Bổ Sung
            </h3>
            <div className={styles.eventInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>📅 Thời gian tạo:</span>
                <span className={styles.infoValue}>
                  {event?.createdAt && formatDate(event.createdAt)}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>🔄 Cập nhật lần cuối:</span>
                <span className={styles.infoValue}>
                  {event?.updatedAt && formatDate(event.updatedAt)}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>🏷️ Mã sự kiện:</span>
                <span className={styles.infoValue}>{event?.id}</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Xóa sự kiện"
        message={
          event
            ? `Bạn có chắc muốn xóa sự kiện "${event.title}" không? Tất cả dữ liệu thanh toán sẽ bị mất và không thể khôi phục.`
            : ""
        }
        confirmText="Xóa sự kiện"
        cancelText="Hủy bỏ"
        type="danger"
      />
    </>
  )
}

export default PersonalEventDetailsModal