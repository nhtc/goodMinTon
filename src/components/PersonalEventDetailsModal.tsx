'use client'
import React, { useState } from 'react'
import Modal from './Modal'
import ConfirmationModal from './ConfirmationModal'
import PersonalEventForm from './PersonalEventForm'
import { AuthorizedComponent } from './AuthorizedComponent'
import styles from './PersonalEventDetailsModal.module.css'
import { apiService } from '../lib/api'
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
  onDelete,
  onPaymentToggle
}) => {
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null)
  const [currentEvent, setCurrentEvent] = useState<PersonalEvent | undefined>(event)

  // Update currentEvent when event prop changes
  React.useEffect(() => {
    setCurrentEvent(event)
  }, [event])

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
    if (!currentEvent?.id || !onDelete) return
    
    try {
      await onDelete(currentEvent.id)
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
      // Use parent's payment toggle handler if provided, otherwise handle locally
      if (onPaymentToggle) {
        await onPaymentToggle(eventId, memberId)
        // The parent handler should trigger refetch, so we don't need to update local state
        return
      }
      
      // Fallback to local API call if no parent handler (backwards compatibility)
      const result = await apiService.personalEvents.togglePayment(eventId, memberId)
      console.log('Payment toggled successfully:', result)
      
      // Update local state optimistically
      if (currentEvent && currentEvent.participants) {
        const updatedParticipants = currentEvent.participants.map(participant => {
          if (participant.memberId === memberId) {
            return {
              ...participant,
              hasPaid: !participant.hasPaid,
              paidAt: !participant.hasPaid ? new Date().toISOString() : undefined
            }
          }
          return participant
        })
        
        setCurrentEvent({
          ...currentEvent,
          participants: updatedParticipants
        })
      }
      
    } catch (error) {
      console.error('Error toggling payment:', error)
      // You could add a toast notification here to show the error to the user
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
      .reduce((sum, p) => sum + (p.customAmount - (p.prePaid || 0)), 0)
    const totalRemaining = event.totalCost - totalCollected

    return {
      totalPaid,
      totalUnpaid,
      totalCollected,
      totalRemaining
    }
  }

  // Calculate totals using the extracted function
  const paymentStats = calculatePaymentStats(currentEvent)
  // Remove duplicate calculations - using paymentStats instead
  const totalCollected = currentEvent?.participants
    ?.filter(p => p.hasPaid)
    .reduce((sum, p) => sum + (p.customAmount - (p.prePaid || 0)), 0) || 0
  const totalRemaining = (currentEvent?.totalCost || 0) - totalCollected

  // If showing edit form
  if (showEditForm && currentEvent) {
    return (
      <Modal 
        isOpen={isOpen} 
        onClose={() => setShowEditForm(false)}
        title="Chỉnh sửa sự kiện"
        size="large"
        disableOverlayClose={true}
      >
        <PersonalEventForm
          onSubmit={handleFormSubmit}
          initialData={currentEvent}
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
        title={currentEvent?.title}
        disableOverlayClose={true}
      >
        <div className={styles.modalContent}>
          {/* Event Header */}
          <div className={styles.eventHeader}>
            <div className={styles.headerInfo}>
              <div className={styles.eventIcon}>🎉</div>
              <div className={styles.eventDetails}>
                <h2 className={styles.eventTitle}>{currentEvent?.title}</h2>
                <div className={styles.eventMeta}>
                  <span className={styles.eventDate}>
                    📅 {currentEvent?.date && formatDate(currentEvent.date)}
                  </span>
                  {currentEvent?.location && (
                    <span className={styles.eventLocation}>
                      📍 {currentEvent.location}
                    </span>
                  )}
                </div>
                {currentEvent?.description && (
                  <p className={styles.eventDescription}>{currentEvent.description}</p>
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
                  {currentEvent?.totalCost ? currentEvent.totalCost.toLocaleString("vi-VN") : '0'}đ
                </span>
              </div>
              <div className={styles.costItem}>
                <span className={styles.costLabel}>👥 Số người tham gia:</span>
                <span className={styles.costValue}>{currentEvent?.participants?.length || 0} người</span>
              </div>
              <div className={styles.costItem}>
                <span className={styles.costLabel}>💳 Chi phí trung bình/người:</span>
                <span className={styles.costValue}>
                  {currentEvent?.totalCost && currentEvent?.participants?.length
                    ? Math.round(currentEvent.totalCost / currentEvent.participants.length).toLocaleString("vi-VN")
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
                Thành Viên Tham Gia ({currentEvent?.participants?.length || 0})
              </h3>
              
            </div>
            <div className={styles.participantsList}>
              {currentEvent?.participants?.map((participant) => {
                const paymentKey = `${currentEvent.id}-${participant.memberId}`
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
                          💰 Số tiền: <strong>{(participant.customAmount - (participant.prePaid || 0)).toLocaleString("vi-VN")}đ</strong>
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
                          onClick={() => currentEvent && handlePaymentToggle(currentEvent.id, participant.memberId)}
                          disabled={isLoading || !onPaymentToggle}
                          className={`${styles.paymentToggleBtn} ${
                            participant.hasPaid ? styles.paid : styles.unpaid
                          } ${!onPaymentToggle ? styles.disabled : ''}`}
                          title={
                            !onPaymentToggle 
                              ? "Bạn không có quyền thay đổi trạng thái thanh toán"
                              : participant.hasPaid
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
                            href={`/payment?personalEventId=${event?.id}&participantId=${participant.memberId}&amount=${participant.customAmount - (participant.prePaid || 0)}&memberName=${encodeURIComponent(participant.member.name)}`}
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
                  {currentEvent?.createdAt && formatDate(currentEvent.createdAt)}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>🔄 Cập nhật lần cuối:</span>
                <span className={styles.infoValue}>
                  {currentEvent?.updatedAt && formatDate(currentEvent.updatedAt)}
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
            ? `Bạn có chắc muốn xóa sự kiện "${currentEvent?.title}" không? Tất cả dữ liệu thanh toán sẽ bị mất và không thể khôi phục.`
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