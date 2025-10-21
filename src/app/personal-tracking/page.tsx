'use client'

import { useState } from 'react'
import { AuthorizedComponent } from '@/components/AuthorizedComponent'
import PersonalEventCard from '@/components/PersonalEventCard'
import PersonalEventDetailsModal from '@/components/PersonalEventDetailsModal'
import PersonalEventForm from '@/components/PersonalEventForm'
import ConfirmationModal from '@/components/ConfirmationModal'
import Modal from '@/components/Modal'
import { usePersonalEvents, useDeletePersonalEvent, useUpdatePersonalEvent, useCreatePersonalEvent } from '@/hooks/useQueries'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/context/AuthContext'
import { apiService } from '@/lib/api'
import { PersonalEvent, PersonalEventFilters, CreatePersonalEventData, UpdatePersonalEventData } from '@/types'
import { filterPersonalEventsByPaymentStatus, PaymentStatusFilter } from '@/utils/paymentFilters'
import { CompoundSelect } from '@/components/ui/select'
import { TEXT_CONSTANTS } from '@/lib/constants/text'
import styles from './page.module.css'// Constants
const PAYMENT_STATUS_OPTIONS = {
  ALL: 'all' as const,
  PAID: 'paid' as const,
  UNPAID: 'unpaid' as const
}

const PersonalTrackingPage: React.FC = () => {
  // Auth
  const { isAuthorized, isAuthenticated } = useAuth()
  
  // State management
  const [selectedEvent, setSelectedEvent] = useState<PersonalEvent | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<PersonalEvent | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<PersonalEvent | null>(null)
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null)
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({})
  const [paymentStatus, setPaymentStatus] = useState<'all' | 'paid' | 'unpaid'>(PAYMENT_STATUS_OPTIONS.ALL)
  const [selectedMember, setSelectedMember] = useState<string>('')

  // Payment status filter options
  const paymentStatusOptions = [
    { value: 'all', label: TEXT_CONSTANTS.personalEvent.filters.paymentStatus.all },
    { value: 'paid', label: TEXT_CONSTANTS.personalEvent.filters.paymentStatus.paid },
    { value: 'unpaid', label: TEXT_CONSTANTS.personalEvent.filters.paymentStatus.unpaid }
  ]

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
  const { data: personalEventsResponse, isLoading, error, refetch } = usePersonalEvents(hasActiveFilters ? filters : undefined)
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

  // Apply payment status filter
  const finalFilteredEvents = filterPersonalEventsByPaymentStatus(filteredEvents, paymentStatus as PaymentStatusFilter)

  // Calculate statistics
  const totalEvents = finalFilteredEvents.length
  const totalParticipants = finalFilteredEvents.reduce((sum, event) => sum + event.participants.length, 0)
  const totalAmount = finalFilteredEvents.reduce((sum, event) => sum + event.totalCost, 0)
  const paidParticipants = finalFilteredEvents.reduce((sum, event) =>
    sum + event.participants.filter(p => p.hasPaid).length, 0
  )
  // Calculate total paid amount (correctly subtracting prepaid amounts)
  // If member filter is active, only calculate for that specific member
  const totalPaidAmount = finalFilteredEvents.reduce((sum, event) => {
    const participantsToCalculate = selectedMember 
      ? event.participants.filter(p => p.memberId === selectedMember)
      : event.participants
    
    return sum + participantsToCalculate
      .filter(p => p.hasPaid)
      .reduce((participantSum, p) => participantSum + (p.customAmount - (p.prePaid || 0)), 0)
  }, 0)// Event handlers
  const handleCreateEvent = () => {
    // Double-check authentication
    if (!isAuthenticated || !isAuthorized) {
      addToast('error', TEXT_CONSTANTS.common.messages.error, 'Bạn cần đăng nhập để tạo sự kiện')
      return
    }
    
    setEditingEvent(null)
    setShowForm(true)
  }

  const handleEditEvent = (event: PersonalEvent) => {
    // Double-check authentication
    if (!isAuthenticated || !isAuthorized) {
      addToast('error', TEXT_CONSTANTS.common.messages.error, 'Bạn cần đăng nhập để chỉnh sửa sự kiện')
      return
    }
    
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
      addToast('success', TEXT_CONSTANTS.common.messages.success, TEXT_CONSTANTS.personalEvent.messages.eventDeleted)
      setShowDeleteConfirm(false)
      setEventToDelete(null)
      if (selectedEvent && selectedEvent.id === eventToDelete.id) {
        setSelectedEvent(null)
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      addToast('error', TEXT_CONSTANTS.common.messages.error, TEXT_CONSTANTS.personalEvent.messages.deleteError)
    }
  }

    // Payment toggle handler for PersonalEventCard
  const handlePaymentToggle = async (eventId: string, memberId: string) => {
    // Check authorization first
    if (!isAuthorized) {
      addToast('error', TEXT_CONSTANTS.common.messages.error, TEXT_CONSTANTS.personalEvent.messages.noPermissionPayment)
      return
    }

    const paymentKey = `${eventId}-${memberId}`
    setPaymentLoading(paymentKey)
    
    try {
      await apiService.personalEvents.togglePayment(eventId, memberId)
      addToast('success', TEXT_CONSTANTS.common.messages.success, TEXT_CONSTANTS.personalEvent.messages.paymentStatusUpdated)
      
      // Refetch data and get fresh results
      const refetchResult = await refetch()
      
      // Update selectedEvent with fresh data if it's the same event
      if (selectedEvent && selectedEvent.id === eventId && refetchResult.data) {
        const updatedEvent = refetchResult.data.data.find((e: PersonalEvent) => e.id === eventId)
        if (updatedEvent) {
          setSelectedEvent(updatedEvent)
        }
      }
    } catch (error) {
      console.error('Error toggling payment:', error)
      addToast('error', TEXT_CONSTANTS.common.messages.error, TEXT_CONSTANTS.personalEvent.messages.paymentUpdateError)
    } finally {
      setPaymentLoading(null)
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
        addToast('success', TEXT_CONSTANTS.common.messages.success, TEXT_CONSTANTS.personalEvent.messages.eventUpdated)
      } else {
        await createPersonalEventMutation.mutateAsync(eventData as CreatePersonalEventData)
        addToast('success', TEXT_CONSTANTS.common.messages.success, TEXT_CONSTANTS.personalEvent.messages.eventCreated)
      }
      setShowForm(false)
      setEditingEvent(null)
    } catch (error) {
      console.error('Error saving event:', error)
      addToast('error', TEXT_CONSTANTS.common.messages.error, TEXT_CONSTANTS.personalEvent.messages.saveError)
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingEvent(null)
  }

  const handleExportToExcel = async () => {
    try {
      // Fetch all personal events without pagination
      const response = await apiService.personalEvents.getAll()
      const allEvents = Array.isArray(response) ? response : response?.data || []
      
      if (allEvents.length === 0) {
        addToast('warning', 'Không có dữ liệu', 'Không có sự kiện nào để xuất!')
        return
      }
      
      // Lazy load Excel export function
      const { exportPersonalEventsToExcel } = await import('@/utils/excelExport')
      exportPersonalEventsToExcel(allEvents)
      
      // Show success message
      addToast('success', 'Xuất dữ liệu thành công', `Đã xuất ${allEvents.length} sự kiện ra file Excel!`)
    } catch (error) {
      console.error('Export error:', error)
      addToast('error', 'Lỗi xuất dữ liệu', 'Không thể xuất dữ liệu. Vui lòng thử lại!')
    }
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
            <AuthorizedComponent 
              requireEdit={true}
              viewOnlyFallback={
                <div className={styles.disabledCreateBtn} title="Đăng nhập để tạo sự kiện">
                  <span className={styles.btnIcon}>🔒</span>
                  <span>Đăng nhập để tạo</span>
                </div>
              }
            >
              <button
                onClick={handleCreateEvent}
                className={styles.createEventBtn}
                title={TEXT_CONSTANTS.personalEvent.titles.createEvent}
              >
                <span className={styles.btnIcon}>➕</span>
                <span>Tạo Sự Kiện</span>
              </button>
            </AuthorizedComponent>

            {/* Export to Excel Button (visible to all) */}
            {filteredEvents.length > 0 && isAuthorized && (
              <button
                onClick={handleExportToExcel}
                className={styles.exportBtn}
                title='Xuất toàn bộ sự kiện ra file Excel'
              >
                <span className={styles.btnIcon}>📊</span>
                <span>Xuất Excel</span>
              </button>
            )}
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
                  {(totalAmount / 1000).toLocaleString('vi-VN')}k
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
            <div className={styles.statCard}>
              <div className={styles.statIcon}>💵</div>
              <div className={styles.statInfo}>
                <div className={styles.statValue}>
                  {(totalPaidAmount / 1000).toLocaleString('vi-VN')}k
                </div>
                <div className={styles.statLabel}>Đã thu thực tế</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <AuthorizedComponent 
            requireEdit={true}
            fallback={null}
          >
            <Modal
              isOpen={showForm}
              title={editingEvent ? TEXT_CONSTANTS.personalEvent.titles.editEvent : TEXT_CONSTANTS.personalEvent.titles.createNewEvent}
              onClose={handleFormCancel}
            >
              <PersonalEventForm
                initialData={editingEvent || undefined}
                isEditing={!!editingEvent}
                isSubmitting={createPersonalEventMutation.isPending || updatePersonalEventMutation.isPending}
                onSubmit={handleFormSubmit}
              />
            </Modal>
          </AuthorizedComponent>
        )}

        {/* Search and Filter */}
        {(personalEvents.length > 0 || hasActiveFilters) && (
          <div className={styles.searchSection}>
            <div className={styles.searchWrapper}>
              <div className={styles.searchIcon}>🔍</div>
              <input
                type="text"
                placeholder={TEXT_CONSTANTS.personalEvent.form.placeholders.searchEvent}
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
                    title={TEXT_CONSTANTS.personalEvent.form.placeholders.startDate}
                  />
                  <span className={styles.dateSeparator}>đến</span>
                  <input
                    type="date"
                    value={dateRange.end || ''}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className={styles.dateInput}
                    title={TEXT_CONSTANTS.personalEvent.form.placeholders.endDate}
                  />
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Trạng thái thanh toán:</label>
                <CompoundSelect
                  value={paymentStatus}
                  onValueChange={(value) => setPaymentStatus(value as 'all' | 'paid' | 'unpaid')}
                  options={paymentStatusOptions}
                  className={styles.filterSelect}
                  placeholder={TEXT_CONSTANTS.personalEvent.form.placeholders.selectPaymentStatus}
                />
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
                Tìm thấy {finalFilteredEvents.length} sự kiện
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
        ) : finalFilteredEvents.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>👥</div>
            <h3 className={styles.emptyTitle}>
              {personalEvents.length === 0
                ? TEXT_CONSTANTS.personalEvent.messages.noEventsFound
                : TEXT_CONSTANTS.personalEvent.messages.noEventsFoundFiltered}
            </h3>
            <p className={styles.emptyDescription}>
              {personalEvents.length === 0
                ? TEXT_CONSTANTS.personalEvent.messages.createFirstEvent
                : TEXT_CONSTANTS.personalEvent.messages.tryDifferentSearch}
            </p>
            {personalEvents.length === 0 && (
              <AuthorizedComponent 
                requireEdit={true}
                viewOnlyFallback={
                  <div className={styles.disabledEmptyAction} title="Đăng nhập để tạo sự kiện">
                    <span className={styles.btnIcon}>🔒</span>
                    Đăng nhập để tạo sự kiện
                  </div>
                }
              >
                <button
                  onClick={handleCreateEvent}
                  className={styles.emptyAction}
                >
                  <span className={styles.btnIcon}>➕</span>
                  Tạo sự kiện đầu tiên
                </button>
              </AuthorizedComponent>
            )}
          </div>
        ) : (
          <div className={styles.eventsSection}>
            <div className={styles.sectionHeader}>
              <h2>📅 Danh Sách Sự Kiện</h2>
              <div className={styles.eventsCount}>
                {finalFilteredEvents.length} sự kiện
              </div>
            </div>

            <div className={styles.eventsGrid}>
              {finalFilteredEvents.map((event, index) => (
                <PersonalEventCard
                  key={event.id}
                  event={event}
                  onClick={(event) => setSelectedEvent(event)}
                  onPaymentToggle={isAuthorized ? handlePaymentToggle : undefined}
                  paymentLoading={paymentLoading}
                  selectedMemberId={selectedMember || undefined}
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
              try {
                if (selectedEvent) {
                  // Update existing event
                  await updatePersonalEventMutation.mutateAsync({
                    eventId: selectedEvent.id,
                    eventData: data as UpdatePersonalEventData
                  })
                  addToast('success', TEXT_CONSTANTS.common.messages.success, TEXT_CONSTANTS.personalEvent.messages.eventUpdated)
                  
                  // Refetch data to get updated event
                  const refetchResult = await refetch()
                  
                  // Update selectedEvent with fresh data
                  if (refetchResult.data) {
                    const updatedEvent = refetchResult.data.data.find((e: PersonalEvent) => e.id === selectedEvent.id)
                    if (updatedEvent) {
                      setSelectedEvent(updatedEvent)
                    }
                  }
                } else {
                  // This shouldn't happen in the details modal since we always have a selectedEvent
                  // But handle it for completeness
                  await createPersonalEventMutation.mutateAsync(data as CreatePersonalEventData)
                  addToast('success', TEXT_CONSTANTS.common.messages.success, TEXT_CONSTANTS.personalEvent.messages.eventCreated)
                  setSelectedEvent(null)
                }
              } catch (error) {
                console.error('Error saving event:', error)
                addToast('error', TEXT_CONSTANTS.common.messages.error, TEXT_CONSTANTS.personalEvent.messages.saveError)
                throw error // Re-throw to let the modal handle the error state
              }
            }}
            onDelete={async (eventId) => {
              const event = personalEvents.find(e => e.id === eventId)
              if (event) {
                handleDeleteEvent(event)
              }
              setSelectedEvent(null)
            }}
            onPaymentToggle={isAuthorized ? handlePaymentToggle : undefined}
          />
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={handleCancelDeleteEvent}
          onConfirm={handleConfirmDeleteEvent}
          title={TEXT_CONSTANTS.personalEvent.confirmations.deleteEvent}
          message={
            eventToDelete
              ? `Bạn có chắc muốn xóa sự kiện "${eventToDelete.title}" không? ${TEXT_CONSTANTS.personalEvent.confirmations.deleteEventMessage}`
              : ""
          }
          confirmText={TEXT_CONSTANTS.personalEvent.confirmations.confirmDelete}
          cancelText={TEXT_CONSTANTS.personalEvent.confirmations.cancelDelete}
          type="danger"
          isLoading={deletePersonalEventMutation.isPending}
        />
      </div>
    </AuthorizedComponent>
  )
}

export default PersonalTrackingPage