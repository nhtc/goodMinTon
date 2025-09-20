'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthorizedComponent } from '@/components/AuthorizedComponent'
import PersonalEventCard from '@/components/PersonalEventCard'
import PersonalEventDetailsModal from '@/components/PersonalEventDetailsModal'
import PersonalEventForm from '@/components/PersonalEventForm'
import ConfirmationModal from '@/components/ConfirmationModal'
import Modal from '@/components/Modal'
import { usePersonalEvents, useDeletePersonalEvent, useUpdatePersonalEvent, useCreatePersonalEvent } from '@/hooks/useQueries'
import { useToast } from '@/hooks/useToast'
import { PersonalEvent, PersonalEventFilters, CreatePersonalEventData, UpdatePersonalEventData } from '@/types'
import styles from './page.module.css'

// Constants
const PAYMENT_STATUS_OPTIONS = {
  ALL: 'all' as const,
  PAID: 'paid' as const,
  UNPAID: 'unpaid' as const
} as const

const TOAST_MESSAGES = {
  EVENT_DELETED: 'Sự kiện đã được xóa thành công',
  EVENT_UPDATED: 'Sự kiện đã được cập nhật thành công',
  EVENT_CREATED: 'Sự kiện đã được tạo thành công',
  DELETE_ERROR: 'Có lỗi xảy ra khi xóa sự kiện',
  SAVE_ERROR: 'Có lỗi xảy ra khi lưu sự kiện'
} as const

const PersonalTrackingPage: React.FC = () => {
  // State management
  const [selectedEvent, setSelectedEvent] = useState<PersonalEvent | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<PersonalEvent | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<PersonalEvent | null>(null)
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({})
  const [paymentStatus, setPaymentStatus] = useState<'all' | 'paid' | 'unpaid'>(PAYMENT_STATUS_OPTIONS.ALL)
  const [selectedMember, setSelectedMember] = useState<string>('')

  // Create filters object
  const filters: PersonalEventFilters = {
    search: searchTerm || undefined,
    startDate: dateRange.start || undefined,
    endDate: dateRange.end || undefined,
    memberId: selectedMember || undefined,
  }

  // Only pass filters if there are actual filter values
  const hasActiveFilters = filters.search || filters.startDate || filters.endDate || filters.memberId
  
  // Hooks
  const { data: personalEventsResponse, isLoading, error } = usePersonalEvents(hasActiveFilters ? filters : undefined)
  const personalEvents = personalEventsResponse?.data || []
  const deletePersonalEventMutation = useDeletePersonalEvent()
  const updatePersonalEventMutation = useUpdatePersonalEvent()
  const createPersonalEventMutation = useCreatePersonalEvent()
  const { addToast } = useToast()

  // Filter events based on search term
  const filteredEvents = personalEvents.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      event.participants.some(p => p.member.name.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesSearch
  })

  // Calculate statistics
  const totalEvents = filteredEvents.length
  const totalParticipants = filteredEvents.reduce((sum, event) => sum + event.participants.length, 0)
  const totalAmount = filteredEvents.reduce((sum, event) => sum + event.totalCost, 0)
  const paidParticipants = filteredEvents.reduce((sum, event) => 
    sum + event.participants.filter(p => p.hasPaid).length, 0
  )

  // Event handlers
  const handleCreateEvent = () => {
    setEditingEvent(null)
    setShowForm(true)
  }

  const handleEditEvent = (event: PersonalEvent) => {
    setEditingEvent(event)
    setShowForm(true)
  }

  const handleDeleteEvent = (event: PersonalEvent) => {
    setEventToDelete(event)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDeleteEvent = async () => {
    if (!eventToDelete) return
    
    try {
      await deletePersonalEventMutation.mutateAsync(eventToDelete.id)
      addToast('success', 'Thành công', TOAST_MESSAGES.EVENT_DELETED)
      setShowDeleteConfirm(false)
      setEventToDelete(null)
      if (selectedEvent && selectedEvent.id === eventToDelete.id) {
        setSelectedEvent(null)
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      addToast('error', 'Lỗi', TOAST_MESSAGES.DELETE_ERROR)
    }
  }

  const handleCancelDeleteEvent = () => {
    setShowDeleteConfirm(false)
    setEventToDelete(null)
  }

  const handleFormSubmit = async (eventData: CreatePersonalEventData | UpdatePersonalEventData) => {
    try {
      if (editingEvent) {
        await updatePersonalEventMutation.mutateAsync({
          eventId: editingEvent.id,
          eventData: eventData as UpdatePersonalEventData
        })
        addToast('success', 'Thành công', TOAST_MESSAGES.EVENT_UPDATED)
      } else {
        await createPersonalEventMutation.mutateAsync(eventData as CreatePersonalEventData)
        addToast('success', 'Thành công', TOAST_MESSAGES.EVENT_CREATED)
      }
      setShowForm(false)
      setEditingEvent(null)
    } catch (error) {
      console.error('Error saving event:', error)
      addToast('error', 'Lỗi', TOAST_MESSAGES.SAVE_ERROR)
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingEvent(null)
  }

  const clearSearch = () => {
    setSearchTerm('')
  }

  const clearFilters = (): void => {
    setDateRange({})
    setPaymentStatus(PAYMENT_STATUS_OPTIONS.ALL)
    setSelectedMember('')
  }

  return (
    <AuthorizedComponent>
      <div className={styles.container}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <div className={styles.pageIcon}>👥</div>
              <div>
                <h1 className={styles.pageTitle}>Theo Dõi Cá Nhân</h1>
                <p className={styles.pageSubtitle}>
                  Quản lý và theo dõi thanh toán cho các sự kiện cá nhân
                </p>
              </div>
            </div>
            <button
              onClick={handleCreateEvent}
              className={styles.createEventBtn}
              title="Tạo sự kiện mới"
            >
              <span className={styles.btnIcon}>➕</span>
              <span>Tạo Sự Kiện</span>
            </button>
          </div>

          {/* Statistics */}
          <div className={styles.statsSection}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📅</div>
              <div className={styles.statInfo}>
                <div className={styles.statValue}>{totalEvents}</div>
                <div className={styles.statLabel}>Sự kiện</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statInfo}>
                <div className={styles.statValue}>{totalParticipants}</div>
                <div className={styles.statLabel}>Tham gia</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>💰</div>
              <div className={styles.statInfo}>
                <div className={styles.statValue}>
                  {totalAmount.toLocaleString('vi-VN')}đ
                </div>
                <div className={styles.statLabel}>Tổng chi phí</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>✅</div>
              <div className={styles.statInfo}>
                <div className={styles.statValue}>
                  {totalParticipants > 0 
                    ? Math.round((paidParticipants / totalParticipants) * 100)
                    : 0}%
                </div>
                <div className={styles.statLabel}>Đã thanh toán</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <Modal
            isOpen={showForm}
            title={editingEvent ? 'Chỉnh Sửa Sự Kiện' : 'Tạo Sự Kiện Mới'}
            onClose={handleFormCancel}
          >
            <PersonalEventForm
              members={[]} // We'll need to get members from somewhere
              initialData={editingEvent || undefined}
              isEditing={!!editingEvent}
              isSubmitting={createPersonalEventMutation.isPending || updatePersonalEventMutation.isPending}
              onSubmit={handleFormSubmit}
            />
          </Modal>
        )}

        {/* Search and Filter */}
        {personalEvents.length > 0 && (
          <div className={styles.searchSection}>
            <div className={styles.searchWrapper}>
              <div className={styles.searchIcon}>🔍</div>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sự kiện, mô tả hoặc tên thành viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className={styles.searchClear}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Controls */}
            <div className={styles.filterControls}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Khoảng thời gian:</label>
                <div className={styles.dateRangeInputs}>
                  <input
                    type="date"
                    value={dateRange.start || ''}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className={styles.dateInput}
                    title="Từ ngày"
                  />
                  <span className={styles.dateSeparator}>đến</span>
                  <input
                    type="date"
                    value={dateRange.end || ''}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className={styles.dateInput}
                    title="Đến ngày"
                  />
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Trạng thái thanh toán:</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as 'all' | 'paid' | 'unpaid')}
                  className={styles.filterSelect}
                  title="Chọn trạng thái thanh toán"
                >
                  <option value="all">Tất cả</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="unpaid">Chưa thanh toán</option>
                </select>
              </div>

              {(dateRange.start || dateRange.end || paymentStatus !== PAYMENT_STATUS_OPTIONS.ALL || selectedMember) && (
                <button
                  onClick={clearFilters}
                  className={styles.clearFiltersBtn}
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>

            {searchTerm && (
              <div className={styles.searchResults}>
                Tìm thấy {filteredEvents.length} sự kiện
              </div>
            )}
          </div>
        )}

        {/* Events List */}
        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <p>Đang tải sự kiện...</p>
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>⚠️</div>
            <h3>Có lỗi xảy ra</h3>
            <p>Không thể tải danh sách sự kiện. Vui lòng thử lại.</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>👥</div>
            <h3 className={styles.emptyTitle}>
              {personalEvents.length === 0
                ? "Chưa có sự kiện nào"
                : "Không tìm thấy sự kiện nào"}
            </h3>
            <p className={styles.emptyDescription}>
              {personalEvents.length === 0
                ? "Hãy tạo sự kiện cá nhân đầu tiên của bạn!"
                : "Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc"}
            </p>
            {personalEvents.length === 0 && (
              <button
                onClick={handleCreateEvent}
                className={styles.emptyAction}
              >
                <span className={styles.btnIcon}>➕</span>
                Tạo sự kiện đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className={styles.eventsSection}>
            <div className={styles.sectionHeader}>
              <h2>📅 Danh Sách Sự Kiện</h2>
              <div className={styles.eventsCount}>
                {filteredEvents.length} sự kiện
              </div>
            </div>

            <div className={styles.eventsGrid}>
              {filteredEvents.map((event, index) => (
                <PersonalEventCard
                  key={event.id}
                  event={event}
                  onClick={(event) => setSelectedEvent(event)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Event Details Modal */}
        {selectedEvent && (
          <PersonalEventDetailsModal
            isOpen={!!selectedEvent}
            event={selectedEvent}
            mode="view"
            onClose={() => setSelectedEvent(null)}
            onSave={async (data) => {
              // Handle save if needed
            }}
            onDelete={async (eventId) => {
              const event = personalEvents.find(e => e.id === eventId)
              if (event) {
                handleDeleteEvent(event)
              }
              setSelectedEvent(null)
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={handleCancelDeleteEvent}
          onConfirm={handleConfirmDeleteEvent}
          title="Xóa sự kiện"
          message={
            eventToDelete
              ? `Bạn có chắc muốn xóa sự kiện "${eventToDelete.title}" không? Tất cả dữ liệu thanh toán sẽ bị mất và không thể khôi phục.`
              : ""
          }
          confirmText="Xóa sự kiện"
          cancelText="Hủy bỏ"
          type="danger"
          isLoading={deletePersonalEventMutation.isPending}
        />
      </div>
    </AuthorizedComponent>
  )
}

export default PersonalTrackingPage
