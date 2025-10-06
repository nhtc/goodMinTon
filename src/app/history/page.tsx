"use client"
import React, { useEffect, useState, lazy, Suspense } from "react"
import Link from "next/link"
import styles from "./page.module.css"
import { apiService } from "../../lib/api"
import {
  AuthorizedComponent,
  EditableContent,
  usePermissions,
} from "../../components/AuthorizedComponent"
import { useToast } from "../../context/ToastContext"
import { capitalize } from "lodash"
import Modal from "../../components/Modal"
import ConfirmationModal from "../../components/ConfirmationModal"
import { CompoundSelect } from "../../components/ui/select"
import { filterGamesByPaymentStatus, PaymentStatusFilter } from "../../utils/paymentFilters"

// Lazy load heavy components for better performance
const GameForm = lazy(() => import("../../components/GameForm"))

interface Member {
  id: string
  name: string
  phone?: string
  avatar?: string
  participantId?: string // For payment tracking
  hasPaid?: boolean // Payment status
  paidAt?: string // Payment timestamp
  prePaid?: number // ✅ Add pre-paid amount
  prePaidCategory?: string // ✅ Add pre-paid category
  customAmount?: number // ✅ Add custom amount for this participant
}

interface Game {
  id: string
  date: string
  location?: string // Add location field
  yardCost: number
  shuttleCockQuantity: number
  shuttleCockPrice: number
  otherFees: number
  totalCost: number
  costPerMember: number
  participants: Member[]
  createdAt: string
}

const HistoryPage = () => {
  const [games, setGames] = useState<Game[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [showForm, setShowForm] = useState(false)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [gameToDelete, setGameToDelete] = useState<{
    id: string
    date: string
  } | null>(null)

  // Filter states
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusFilter>('all')
  const [searchTerm, setSearchTerm] = useState("")

  // Payment status filter options
  const paymentStatusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'paid', label: 'Đã thanh toán đầy đủ' },
    { value: 'unpaid', label: 'Còn người chưa trả' }
  ]
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null)
  const { canEdit, userRole } = usePermissions()
  const { showSuccess, showError } = useToast()

  // ✅ Helper function to get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Sân":
        return "🏟️"
      case "Cầu":
        return "🏸"
      case "Nước":
        return "💧"
      default:
        return "💸"
    }
  }

  // ✅ Helper function to calculate remaining amount for a participant (can be negative if overpaid)
  const getMemberRemainingAmount = (
    participant: Member,
    costPerMember: number
  ) => {
    const prePaid = participant.prePaid || 0
    const customAmount = participant.customAmount || 0
    const actualAmount = costPerMember + customAmount - prePaid
    return actualAmount
  }

  // ✅ Helper function to get total pre-paid for a game
  const getGameTotalPrePaid = (game: Game) => {
    return game.participants.reduce((sum, participant) => {
      return sum + (participant.prePaid || 0)
    }, 0)
  }

  // ✅ Helper function to get total remaining to collect for a game
  const getGameTotalRemaining = (game: Game) => {
    return game.participants.reduce((sum, participant) => {
      return sum + getMemberRemainingAmount(participant, game.costPerMember)
    }, 0)
  }

  // ✅ Helper function to get pre-paid breakdown by category
  const getPrePaidByCategory = (game: Game) => {
    const categoryBreakdown: { [key: string]: number } = {}

    game.participants.forEach(participant => {
      if (participant.prePaid && participant.prePaid > 0) {
        const category = participant.prePaidCategory || "Khác"
        categoryBreakdown[category] =
          (categoryBreakdown[category] || 0) + participant.prePaid
      }
    })

    return categoryBreakdown
  }

  const fetchGames = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await apiService.games.getAll()
      setGames(data)
    } catch (error) {
      console.error("Error fetching games:", error)
      setError(
        error instanceof Error
          ? error.message
          : "Không thể tải dữ liệu trận đấu"
      )
      setGames([])
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async () => {
    try {
      const data = await apiService.members.getActive() // Only fetch active members for game selection
      setMembers(data)
    } catch (error) {
      console.error("Error fetching members:", error)
      setMembers([])
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchGames(), fetchMembers()])
    }
    loadData()
  }, [])

  const handleGameCreated = async () => {
    await fetchGames()
    setShowForm(false)
    setEditingGame(null)
  }

  const handleDeleteGame = (game: Game) => {
    setGameToDelete({
      id: game.id,
      date: new Date(game.date).toLocaleDateString("vi-VN"),
    })
    setShowDeleteConfirm(true)
  }

  const handleConfirmDeleteGame = async () => {
    if (!gameToDelete) return

    try {
      setDeleteLoading(gameToDelete.id)
      await apiService.games.delete(gameToDelete.id)
      await fetchGames()

      if (selectedGame?.id === gameToDelete.id) {
        setSelectedGame(null)
      }

      setShowDeleteConfirm(false)
      setGameToDelete(null)
      showSuccess("Thành công", "Đã xóa trận đấu thành công")
    } catch (error) {
      console.error("Error deleting game:", error)
      showError("Lỗi", error instanceof Error ? error.message : "Không thể xóa trận đấu")
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleCancelDeleteGame = () => {
    setShowDeleteConfirm(false)
    setGameToDelete(null)
  }

  const handleEditGame = (game: Game) => {
    setEditingGame(game)
    setShowForm(true)
  }

  const handleCloseEditGame = () => {
    setEditingGame(null)
    setShowForm(false)
  }

  const handleGameUpdated = async () => {
    await fetchGames()
    setShowForm(false)
    setEditingGame(null)
    // Also update selectedGame if it was the one being edited
    if (selectedGame && editingGame && selectedGame.id === editingGame.id) {
      // Fetch the updated game data
      try {
        const updatedGame = await apiService.games.getById(selectedGame.id)
        setSelectedGame(updatedGame)
      } catch (error) {
        console.error("Error fetching updated game:", error)
        setSelectedGame(null)
      }
    }
  }

  // Handle payment toggle
  const handlePaymentToggle = async (
    gameId: string,
    memberId: string,
    currentStatus: boolean
  ) => {
    const paymentKey = `${gameId}-${memberId}`
    setPaymentLoading(paymentKey)

    try {
      await apiService.games.togglePayment(gameId, memberId, !currentStatus)

      // Update local state
      setGames(prevGames =>
        prevGames.map(game => {
          if (game.id === gameId) {
            return {
              ...game,
              participants: game.participants.map(p => {
                if (p.id === memberId) {
                  return {
                    ...p,
                    hasPaid: !currentStatus,
                    paidAt: !currentStatus
                      ? new Date().toISOString()
                      : undefined,
                  }
                }
                return p
              }),
            }
          }
          return game
        })
      )

      // Update selected game modal if open
      if (selectedGame && selectedGame.id === gameId) {
        setSelectedGame(prev => ({
          ...prev!,
          participants: prev!.participants.map(p => {
            if (p.id === memberId) {
              return {
                ...p,
                hasPaid: !currentStatus,
                paidAt: !currentStatus ? new Date().toISOString() : undefined,
              }
            }
            return p
          }),
        }))
      }
    } catch (error) {
      console.error("Error updating payment:", error)
      showError("Lỗi", "Không thể cập nhật trạng thái thanh toán")
    } finally {
      setPaymentLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getTotalStats = () => {
    const totalGames = games.length
    const totalCost = games.reduce((sum, game) => sum + game.totalCost, 0)
    const avgCostPerGame = totalGames > 0 ? totalCost / totalGames : 0
    const totalParticipants = new Set(
      games.flatMap(game => game.participants.map(p => p.id))
    ).size
    return { totalGames, totalCost, avgCostPerGame, totalParticipants }
  }

  const filteredGames = games.filter(
    game =>
      formatDate(game.date).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (game.location &&
        game.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      game.participants.some(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  )

  // Apply payment status filter
  const finalFilteredGames = filterGamesByPaymentStatus(filteredGames, paymentStatus)

  const stats = getTotalStats()

  // Modal close handlers
  const handleCloseModal = () => {
    setSelectedGame(null)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseModal()
    }
  }

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedGame) {
        handleCloseModal()
      }
    }

    if (selectedGame) {
      document.addEventListener("keydown", handleEscKey)
      document.body.classList.add("modal-open")
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey)
      document.body.classList.remove("modal-open")
    }
  }, [selectedGame])

  if (loading) {
    return (
      <div className={styles.historyLoading}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <h2>Đang tải lịch sử trận đấu...</h2>
          <p>Vui lòng đợi một chút</p>
        </div>
      </div>
    )
  }

  return (
    <AuthorizedComponent>
      <div className={styles.historyPage}>
        {/* Header Section */}
        <div className={styles.historyHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerInfo}>
              <div className={styles.headerIconWrapper}>
                <div className={styles.headerIcon}>🏸</div>
                <div className={styles.iconGlow}></div>
              </div>
              <div className={styles.headerText}>
                <h1 className={styles.headerTitle}>Lịch Sử Trận Đấu</h1>
                <p className={styles.headerSubtitle}>
                  Theo dõi và quản lý tất cả các trận cầu lông của bạn
                </p>
              </div>
            </div>

            <div className={styles.headerActions}>
              {error && (
                <button
                  onClick={fetchGames}
                  className={`${styles.actionBtn} ${styles.retryBtn}`}
                  disabled={loading}
                  aria-label='Thử lại tải dữ liệu'
                >
                  {loading ? (
                    <div className={styles.btnSpinner} aria-hidden='true'></div>
                  ) : (
                    <span className={styles.btnIcon} aria-hidden='true'>
                      🔄
                    </span>
                  )}
                  <span className={styles.btnText}>Thử lại</span>
                </button>
              )}

              {/* Permission Indicator */}
              <div className={`${styles.permissionBadge} ${styles[userRole]}`}>
                <span>
                  {userRole === "admin"
                    ? "👑 "
                    : userRole === "editor"
                    ? "✏️ "
                    : "👁️ "}
                </span>
                <span>{capitalize(userRole)}</span>
              </div>

              {/* Edit-only: Add Game Button */}
              <EditableContent
                viewContent={<div className={styles.viewOnlyIndicator}></div>}
              >
                <button
                  onClick={() => setShowForm(!showForm)}
                  className={`${styles.actionBtn} ${styles.primaryBtn} ${
                    showForm ? styles.active : ""
                  }`}
                  disabled={loading}
                  aria-label={
                    showForm ? "Hủy thêm trận đấu" : "Thêm trận đấu mới"
                  }
                >
                  <span className={styles.btnIcon} aria-hidden='true'>
                    {showForm ? "✕" : "➕"}
                  </span>
                  <span className={styles.btnText}>
                    {showForm ? "Hủy" : "Trận đấu mới"}
                  </span>
                </button>
              </EditableContent>
            </div>
          </div>
        </div>

        <div className={styles.historyContainer}>
          {/* Error Alert */}
          {error && (
            <div className={styles.errorAlert}>
              <div className={styles.alertContent}>
                <div className={styles.alertIcon}>⚠️</div>
                <div className={styles.alertText}>
                  <strong>Có lỗi xảy ra:</strong> {error}
                </div>
              </div>
              <button
                onClick={() => setError("")}
                className={styles.alertClose}
              >
                ✕
              </button>
            </div>
          )}

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.gamesStat}`}>
              <div className={styles.statIcon}>🎯</div>
              <div className={styles.statValue}>{stats.totalGames}</div>
              <div className={styles.statLabel}>Tổng trận đấu</div>
              <div className={styles.statTrend}>
                {stats.totalGames > 0 && (
                  <span className={styles.trendText}>
                    +{stats.totalGames} trận
                  </span>
                )}
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.costStat}`}>
              <div className={styles.statIcon}>💰</div>
              <div className={styles.statValue}>
                {stats.totalCost.toLocaleString("vi-VN")}đ
              </div>
              <div className={styles.statLabel}>Tổng chi phí</div>
              <div className={styles.statTrend}>
                {stats.totalCost > 0 && (
                  <span className={styles.trendText}>Đã chi tiêu</span>
                )}
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.avgStat}`}>
              <div className={styles.statIcon}>📊</div>
              <div className={styles.statValue}>
                {stats.avgCostPerGame.toLocaleString("vi-VN")}đ
              </div>
              <div className={styles.statLabel}>TB mỗi trận</div>
              <div className={styles.statTrend}>
                {stats.avgCostPerGame > 0 && (
                  <span className={styles.trendText}>Trung bình</span>
                )}
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.playersStat}`}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statValue}>{stats.totalParticipants}</div>
              <div className={styles.statLabel}>Thành viên tham gia</div>
              <div className={styles.statTrend}>
                {stats.totalParticipants > 0 && (
                  <span className={styles.trendText}>Duy nhất</span>
                )}
              </div>
            </div>
          </div>

          {/* Game Form Modal */}
            <Modal
              isOpen={showForm}
              onClose={handleCloseEditGame}
              title={editingGame ? "Chỉnh Sửa Trận Đấu" : "Thêm Trận Đấu Mới"}
              size='large'
            >
              <EditableContent
                viewContent={
                  <div className={styles.authViewOnly}>
                    <span className={styles.authIcon}>👁️</span>
                    <h3>Chế độ xem</h3>
                    <p>
                      Bạn chỉ có quyền xem. Liên hệ quản trị viên để thêm trận
                      đấu mới.
                    </p>
                  </div>
                }
              >
                <Suspense
                  fallback={
                    <div className={styles.loadingForm}>
                      <div className={styles.loadingSpinner}></div>
                      <p>Đang tải form tạo trận đấu...</p>
                    </div>
                  }
                >
                  <GameForm
                    members={members}
                    onGameCreated={
                      editingGame ? handleGameUpdated : handleGameCreated
                    }
                    gameData={editingGame}
                    isEditing={!!editingGame}
                  />
                </Suspense>
              </EditableContent>
            </Modal>

          {/* Search and Filter */}
          {games.length > 0 && (
            <div className={styles.searchSection}>
              <div className={styles.searchWrapper}>
                <div className={styles.searchIcon}>🔍</div>
                <input
                  type='text'
                  placeholder='Tìm kiếm theo ngày, địa điểm hoặc tên thành viên...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className={styles.searchClear}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Payment Status Filter */}
              <div className={styles.filterControls}>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Trạng thái thanh toán:</label>
                  <CompoundSelect
                    value={paymentStatus}
                    onValueChange={(value) => setPaymentStatus(value as PaymentStatusFilter)}
                    options={paymentStatusOptions}
                    className={styles.filterSelect}
                    placeholder="Chọn trạng thái thanh toán"
                  />
                </div>

                {paymentStatus !== 'all' && (
                  <button
                    onClick={() => setPaymentStatus('all')}
                    className={styles.clearFiltersBtn}
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>

              {(searchTerm || paymentStatus !== 'all') && (
                <div className={styles.searchResults}>
                  Tìm thấy {finalFilteredGames.length} trận đấu
                </div>
              )}
            </div>
          )}

          {/* Games List */}
          {finalFilteredGames.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🏸</div>
              <h3 className={styles.emptyTitle}>
                {games.length === 0
                  ? "Chưa có trận đấu nào"
                  : "Không tìm thấy trận đấu nào"}
              </h3>
              <p className={styles.emptyDescription}>
                {games.length === 0
                  ? "Hãy thêm trận đấu đầu tiên của bạn!"
                  : "Thử tìm kiếm với từ khóa khác"}
              </p>
              {games.length === 0 && (
                <button
                  onClick={() => setShowForm(true)}
                  className={styles.emptyAction}
                >
                  <span className={styles.btnIcon}>➕</span>
                  Thêm trận đấu đầu tiên
                </button>
              )}
            </div>
          ) : (
            <div className={styles.gamesSection}>
              <div className={styles.sectionHeader}>
                <h2>📅 Danh Sách Trận Đấu</h2>
                <div className={styles.gamesCount}>
                  {finalFilteredGames.length} trận đấu
                </div>
              </div>

              <div className={styles.gamesGrid}>
                {finalFilteredGames.map((game, index) => {
                  const paidCount = game.participants.filter(
                    p => p.hasPaid
                  ).length
                  const unpaidCount = game.participants.length - paidCount

                  // ✅ Calculate totals including pre-pays
                  const totalPrePaid = getGameTotalPrePaid(game)
                  const totalRemaining = getGameTotalRemaining(game)
                  const totalCollectedFromPaid = game.participants
                    .filter(p => p.hasPaid)
                    .reduce(
                      (sum, p) =>
                        sum + getMemberRemainingAmount(p, game.costPerMember),
                      0
                    )

                  return (
                    <div
                      key={game.id}
                      className={styles.gameCard}
                      data-animation-index={index}
                    >
                      {/* Game Header */}
                      <div className={styles.gameHeader}>
                        <div className={styles.gameDateInfo}>
                          <div className={styles.gameDate}>
                            {new Date(game.date).getDate()}
                          </div>
                          <div className={styles.gameMonth}>
                            Tháng {new Date(game.date).getMonth() + 1}
                          </div>
                        </div>
                        <div className={styles.gameTitleInfo}>
                          <h3 className={styles.gameTitle}>
                            {formatDate(game.date)}
                          </h3>
                          <p className={styles.gameSubtitle}>
                            {game.location && `📍 ${game.location} • `}
                            {game.participants.length} người tham gia
                          </p>
                        </div>
                      </div>

                      {/* Game Stats */}
                      <div className={styles.gameStats}>
                        <div className={styles.statItem}>
                          <div className={styles.statIconSmall}>💰</div>
                          <div className={styles.statInfo}>
                            <div className={styles.statValueSmall}>
                              {game.totalCost.toLocaleString("vi-VN")}đ
                            </div>
                            <div className={styles.statLabelSmall}>
                              Tổng chi phí
                            </div>
                          </div>
                        </div>
                        <div className={styles.statItem}>
                          <div className={styles.statIconSmall}>👤</div>
                          <div className={styles.statInfo}>
                            <div className={styles.statValueSmall}>
                              {game.costPerMember.toLocaleString("vi-VN")}đ
                            </div>
                            <div className={styles.statLabelSmall}>
                              Mỗi người
                            </div>
                          </div>
                        </div>
                        {/* ✅ Add pre-pay info if exists */}
                        {totalPrePaid > 0 && (
                          <div className={styles.statItem}>
                            <div className={styles.statIconSmall}>💸</div>
                            <div className={styles.statInfo}>
                              <div className={styles.statValueSmall}>
                                {totalPrePaid.toLocaleString("vi-VN")}đ
                              </div>
                              <div className={styles.statLabelSmall}>
                                Đã trả trước
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Payment Status */}
                      <div className={styles.paymentStatusCard}>
                        <div className={styles.paymentHeader}>
                          <span className={styles.paymentTitle}>
                            💰 Thanh toán
                          </span>
                          <div className={styles.paymentSummary}>
                            <span
                              className={`${styles.paymentBadge} ${
                                styles.paid
                              } ${paidCount > 0 ? styles.active : ""}`}
                            >
                              ✅ {paidCount}
                            </span>
                            <span
                              className={`${styles.paymentBadge} ${
                                styles.unpaid
                              } ${unpaidCount > 0 ? styles.active : ""}`}
                            >
                              ⏳ {unpaidCount}
                            </span>
                          </div>
                        </div>

                        <div className={styles.participantsPaymentList}>
                          {game.participants.map(participant => {
                            const paymentKey = `${game.id}-${participant.id}`
                            const isLoading = paymentLoading === paymentKey
                            const remainingAmount = getMemberRemainingAmount(
                              participant,
                              game.costPerMember
                            )
                            const prePaid = participant.prePaid || 0
                            const customAmount = participant.customAmount || 0
                            const actualAmount = game.costPerMember + customAmount // Total amount they need to pay

                            return (
                              <div
                                key={participant.id}
                                className={`${styles.participantPaymentItem} ${
                                  participant.hasPaid
                                    ? styles.paid
                                    : styles.unpaid
                                }`}
                              >
                                <button
                                  onClick={() =>
                                    canEdit &&
                                    handlePaymentToggle(
                                      game.id,
                                      participant.id,
                                      participant.hasPaid || false
                                    )
                                  }
                                  disabled={isLoading || !canEdit}
                                  className={`${styles.participantPaymentBtn} ${
                                    !canEdit ? styles.disabled : ""
                                  }`}
                                  title={
                                    !canEdit
                                      ? "⚠️ Bạn không có quyền chỉnh sửa thanh toán"
                                      : participant.hasPaid
                                      ? `✅ ${participant.name} đã thanh toán - Nhấn để hủy`
                                      : `💰 ${participant.name} chưa thanh toán - Nhấn để xác nhận đã trả`
                                  }
                                >
                                  <div
                                    className={styles.participantAvatarSmall}
                                  >
                                    {participant.avatar ? (
                                      <img 
                                        src={participant.avatar} 
                                        alt={`${participant.name}'s avatar`}
                                        className={styles.participantAvatarImage}
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                          if (fallback) fallback.style.display = 'flex';
                                        }}
                                      />
                                    ) : null}
                                    <div 
                                      className={styles.participantAvatarFallback}
                                      style={{ display: participant.avatar ? 'none' : 'flex' }}
                                    >
                                      {participant.name.charAt(0).toUpperCase()}
                                    </div>
                                  </div>
                                  <div className={styles.participantInfoSmall}>
                                    <div
                                      className={styles.participantNameSmall}
                                    >
                                      {participant.name}
                                    </div>
                                    <div className={styles.participantAmount}>
                                      {/* ✅ Show detailed amount breakdown */}
                                      {(prePaid > 0 || customAmount > 0) ? (
                                        <div className={styles.amountBreakdown}>
                                          <div
                                            className={styles.baseAmount}
                                          >
                                            {game.costPerMember.toLocaleString(
                                              "vi-VN"
                                            )}
                                            đ
                                          </div>
                                          
                                          {/* Custom additional amount */}
                                          {customAmount > 0 && (
                                            <div className={styles.customAmount}>
                                              +⚙️ {customAmount.toLocaleString("vi-VN")}đ
                                            </div>
                                          )}
                                          
                                          {/* Keep existing prepaid amount display */}
                                          {prePaid > 0 && (
                                            <div className={styles.prepaidAmount}>
                                              -💸{prePaid.toLocaleString("vi-VN")}đ
                                            </div>
                                          )}
                                          
                                          {/* Final remaining amount */}
                                          <div
                                            className={styles.remainingAmount}
                                          >
                                            ={" "}
                                            {remainingAmount.toLocaleString(
                                              "vi-VN"
                                            )}
                                            đ
                                          </div>
                                        </div>
                                      ) : (
                                        <div>
                                          {remainingAmount.toLocaleString(
                                            "vi-VN"
                                          )}đ
                                          {customAmount > 0 && (
                                            <span className={styles.customAmountIndicator} title={`Có thêm phí: +${customAmount.toLocaleString("vi-VN")}đ (Tổng: ${(game.costPerMember + customAmount).toLocaleString("vi-VN")}đ)`}>
                                              ⚙️
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    {/* ✅ Move payment time inside participant info */}
                                    {participant.hasPaid &&
                                      participant.paidAt && (
                                        <div
                                          className={
                                            styles.participantPaymentTime
                                          }
                                        >
                                          💰{" "}
                                          {new Date(
                                            participant.paidAt
                                          ).toLocaleDateString("vi-VN", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </div>
                                      )}
                                  </div>
                                  <div className={styles.paymentStatusIcon}>
                                    {isLoading ? (
                                      <div
                                        className={styles.paymentSpinner}
                                      ></div>
                                    ) : participant.hasPaid ? (
                                      <span className={styles.paidIcon}>
                                        ✅
                                      </span>
                                    ) : (
                                      <span className={styles.unpaidIcon}>
                                        ⏳
                                      </span>
                                    )}
                                  </div>
                                </button>
                              </div>
                            )
                          })}
                        </div>

                        {/* ✅ Updated payment total to show correct amounts */}
                        <div className={styles.paymentTotals}>
                          {totalPrePaid > 0 && (
                            <div
                              className={`${styles.paymentTotal} ${styles.prepaid}`}
                            >
                              <span className={styles.totalLabel}>
                                💸 Đã trả trước:
                              </span>
                              <span className={styles.totalAmount}>
                                {totalPrePaid.toLocaleString("vi-VN")}đ
                              </span>
                            </div>
                          )}
                          {paidCount > 0 && (
                            <div
                              className={`${styles.paymentTotal} ${styles.collected}`}
                            >
                              <span className={styles.totalLabel}>
                                ✅ Đã thu thêm:
                              </span>
                              <span className={styles.totalAmount}>
                                {totalCollectedFromPaid.toLocaleString("vi-VN")}
                                đ
                              </span>
                            </div>
                          )}
                          <div
                            className={`${styles.paymentTotal} ${styles.remaining}`}
                          >
                            <span className={styles.totalLabel}>
                              ⏳ Còn cần thu:
                            </span>
                            <span className={styles.totalAmount}>
                              {game.participants
                                .filter(p => !p.hasPaid)
                                .reduce(
                                  (sum, p) =>
                                    sum +
                                    getMemberRemainingAmount(
                                      p,
                                      game.costPerMember
                                    ),
                                  0
                                )
                                .toLocaleString("vi-VN")}
                              đ
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Game Actions */}
                      <div className={styles.gameActions}>
                        {/* Primary Action - Chi tiết button (full width) */}
                        <div className={styles.gameActionsPrimary}>
                          <button
                            onClick={() => setSelectedGame(game)}
                            className={`${styles.gameActionBtn} ${styles.viewBtn} ${styles.primary}`}
                            title='Xem chi tiết trận đấu'
                          >
                            <span className={styles.btnIcon}>👁️</span>
                            <span>Chi tiết trận đấu</span>
                          </button>
                        </div>

                        {/* Secondary Actions - Other buttons in row */}
                        <div className={styles.gameActionsSecondary}>
                          <Link
                            href={`/payment`}
                            className={`${styles.gameActionBtn} ${styles.paymentBtn} ${styles.secondary}`}
                            title='QR thanh toán'
                          >
                            <span className={styles.btnIcon}>💳</span>
                            <span>QR Pay</span>
                          </Link>

                          {/* Admin-only Edit and Delete buttons */}
                          {canEdit && (
                            <>
                              <button
                                onClick={() => handleEditGame(game)}
                                className={`${styles.gameActionBtn} ${styles.editBtn} ${styles.secondary}`}
                                title='Chỉnh sửa trận đấu'
                              >
                                <span className={styles.btnIcon}>✏️</span>
                                <span>Sửa</span>
                              </button>

                              <button
                                onClick={() => handleDeleteGame(game)}
                                className={`${styles.gameActionBtn} ${styles.deleteBtn} ${styles.secondary}`}
                                title='Xóa trận đấu'
                                disabled={deleteLoading === game.id}
                              >
                                {deleteLoading === game.id ? (
                                  <>
                                    <div className={styles.btnSpinner}></div>
                                    <span>Xóa...</span>
                                  </>
                                ) : (
                                  <>
                                    <span className={styles.btnIcon}>🗑️</span>
                                    <span>Xóa</span>
                                  </>
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Game Card Glow Effect */}
                      <div className={styles.cardGlow}></div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Game Detail Modal - Enhanced with overlay click */}
        {selectedGame && (
          <div className={styles.modalOverlay} onClick={handleOverlayClick}>
            <div className={`${styles.modalContent} ${styles.modalWide}`}>
              <div className={styles.modalHeader}>
                <div className={styles.modalTitleSection}>
                  <div className={styles.modalIcon}>🏸</div>
                  <div>
                    <h3 className={styles.modalTitle}>Chi Tiết Trận Đấu</h3>
                    <p className={styles.modalSubtitle}>
                      {formatDate(selectedGame.date)}
                      {selectedGame.location && ` • ${selectedGame.location}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className={styles.modalClose}
                  aria-label='Đóng modal'
                >
                  ✕
                </button>
              </div>

              <div className={styles.modalBody}>
                {/* Cost Breakdown */}
                <div className={styles.modalSection}>
                  <h4 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>💰</span>
                    Chi Phí Chi Tiết
                  </h4>
                  <div className={styles.costBreakdown}>
                    <div className={styles.costItem}>
                      <span className={styles.costLabel}>🏟️ Thuê sân:</span>
                      <span className={styles.costValue}>
                        {selectedGame.yardCost.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className={styles.costItem}>
                      <span className={styles.costLabel}>
                        🏸 Cầu lông ({selectedGame.shuttleCockQuantity} quả):
                      </span>
                      <span className={styles.costValue}>
                        {(
                          selectedGame.shuttleCockQuantity *
                          selectedGame.shuttleCockPrice
                        ).toLocaleString("vi-VN")}
                        đ
                      </span>
                    </div>
                    <div className={styles.costItem}>
                      <span className={styles.costLabel}>📋 Chi phí khác:</span>
                      <span className={styles.costValue}>
                        {selectedGame.otherFees.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className={styles.costTotal}>
                      <span className={styles.totalLabel}>Tổng cộng:</span>
                      <span className={styles.totalValue}>
                        {selectedGame.totalCost.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className={styles.costPerMember}>
                      <span className={styles.perMemberLabel}>Mỗi người:</span>
                      <span className={styles.perMemberValue}>
                        {selectedGame.costPerMember.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    {/* ✅ Add pre-pay breakdown in modal */}
                    {getGameTotalPrePaid(selectedGame) > 0 && (
                      <div className={styles.prepayBreakdown}>
                        <div className={`${styles.costItem} ${styles.prepay}`}>
                          <span className={styles.costLabel}>
                            💸 Tổng đã trả trước:
                          </span>
                          <span className={styles.costValue}>
                            -
                            {getGameTotalPrePaid(selectedGame).toLocaleString(
                              "vi-VN"
                            )}
                            đ
                          </span>
                        </div>

                        {/* Category breakdown */}
                        {Object.entries(getPrePaidByCategory(selectedGame)).map(
                          ([category, amount]) => (
                            <div
                              key={category}
                              className={`${styles.costItem} ${styles.categoryBreakdown}`}
                            >
                              <span className={styles.costLabel}>
                                {getCategoryIcon(category)} {category}:
                              </span>
                              <span className={styles.costValue}>
                                -{amount.toLocaleString("vi-VN")}đ
                              </span>
                            </div>
                          )
                        )}

                        <div
                          className={`${styles.costItem} ${styles.remaining}`}
                        >
                          <span className={styles.costLabel}>
                            ⏳ Tổng còn cần thu:
                          </span>
                          <span className={styles.costValue}>
                            {getGameTotalRemaining(selectedGame).toLocaleString(
                              "vi-VN"
                            )}
                            đ
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* QR Payment Section */}
                <div className={styles.modalSection}>
                  <h4 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>💳</span>
                    Thanh Toán QR
                  </h4>
                  <div className={styles.qrPaymentSection}>
                    <div className={styles.qrPaymentInfo}>
                      <div className={styles.qrPaymentDescription}>
                        <p>
                          <span className={styles.qrIcon}>📱</span>
                          Sử dụng mã QR để thanh toán nhanh chóng và tiện lợi
                        </p>
                        <div className={styles.qrFeatures}>
                          <div className={styles.qrFeature}>
                            <span className={styles.featureIcon}>⚡</span>
                            <span>Thanh toán tức thì</span>
                          </div>
                          <div className={styles.qrFeature}>
                            <span className={styles.featureIcon}>🔐</span>
                            <span>An toàn & bảo mật</span>
                          </div>
                          <div className={styles.qrFeature}>
                            <span className={styles.featureIcon}>📊</span>
                            <span>Tự động đối soát</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={styles.qrPaymentActions}>
                      <Link
                        href={`/payment`}
                        className={styles.qrPaymentBtn}
                        onClick={handleCloseModal}
                        title='Mở trang thanh toán QR'
                      >
                        <span className={styles.qrBtnIcon}>💳</span>
                        <div className={styles.qrBtnContent}>
                          <div className={styles.qrBtnText}>Thanh Toán QR</div>
                          <div className={styles.qrBtnSubtext}>
                            Chọn thành viên & quét mã
                          </div>
                        </div>
                        <span className={styles.qrBtnArrow}>→</span>
                      </Link>

                      {/* Individual Member QR Pay buttons */}
                      <div className={styles.memberQrButtons}>
                        <p className={styles.memberQrTitle}>
                          <span className={styles.memberQrIcon}>👥</span>
                          Thanh toán cho từng thành viên:
                        </p>
                        <div className={styles.memberQrGrid}>
                          {selectedGame.participants
                            .filter(
                              p =>
                                !p.hasPaid &&
                                getMemberRemainingAmount(
                                  p,
                                  selectedGame.costPerMember
                                ) > 0
                            )
                            .map(participant => {
                              const remainingAmount = getMemberRemainingAmount(
                                participant,
                                selectedGame.costPerMember
                              )
                              return (
                                <Link
                                  key={participant.id}
                                  href={`/payment?gameId=${
                                    selectedGame.id
                                  }&memberName=${encodeURIComponent(
                                    participant.name
                                  )}&amount=${remainingAmount}&content=${encodeURIComponent(
                                    participant.name.toUpperCase()
                                  )} TRA TIEN CAU LONG`}
                                  className={styles.memberQrBtn}
                                  onClick={handleCloseModal}
                                  title={`QR thanh toán cho ${participant.name}`}
                                >
                                  <div className={styles.memberQrAvatar}>
                                    {participant.avatar ? (
                                      <img 
                                        src={participant.avatar} 
                                        alt={`${participant.name}'s avatar`}
                                        className={styles.memberQrAvatarImage}
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                          if (fallback) fallback.style.display = 'flex';
                                        }}
                                      />
                                    ) : null}
                                    <div 
                                      className={styles.memberQrAvatarFallback}
                                      style={{ display: participant.avatar ? 'none' : 'flex' }}
                                    >
                                      {participant.name.charAt(0).toUpperCase()}
                                    </div>
                                  </div>
                                  <div className={styles.memberQrInfo}>
                                    <div className={styles.memberQrName}>
                                      {participant.name}
                                    </div>
                                    <div className={styles.memberQrAmount}>
                                      {remainingAmount.toLocaleString("vi-VN")}đ
                                    </div>
                                  </div>
                                  <span className={styles.memberQrIcon}>
                                    💳
                                  </span>
                                </Link>
                              )
                            })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Participants with Payment Status */}
                <div className={styles.modalSection}>
                  <h4 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>👥</span>
                    Thành Viên Tham Gia ({selectedGame.participants.length})
                  </h4>
                  <div className={styles.participantsList}>
                    {selectedGame.participants.map(participant => {
                      const paymentKey = `${selectedGame.id}-${participant.id}`
                      const isLoading = paymentLoading === paymentKey
                      const remainingAmount = getMemberRemainingAmount(
                        participant,
                        selectedGame.costPerMember
                      )
                      const prePaid = participant.prePaid || 0
                      const customAmount = participant.customAmount || 0
                      const actualAmount = selectedGame.costPerMember + customAmount // Total amount they need to pay

                      return (
                        <div
                          key={participant.id}
                          className={`${styles.participantItemModal} ${
                            participant.hasPaid ? styles.paid : styles.unpaid
                          }`}
                        >
                          <div className={styles.participantInfoWrapper}>
                            <div className={styles.participantAvatarLarge}>
                              {participant.avatar ? (
                                <img 
                                  src={participant.avatar} 
                                  alt={`${participant.name}'s avatar`}
                                  className={styles.participantAvatarLargeImage}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div 
                                className={styles.participantAvatarLargeFallback}
                                style={{ display: participant.avatar ? 'none' : 'flex' }}
                              >
                                {participant.name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className={styles.participantInfo}>
                              <div className={styles.participantName}>
                                {participant.name}
                              </div>
                              {participant.phone && (
                                <div className={styles.participantPhone}>
                                  📱 {participant.phone}
                                </div>
                              )}
                              {/* ✅ Show payment breakdown in modal */}
                              <div
                                className={styles.participantPaymentBreakdown}
                              >
                                <div className={styles.breakdownItem}>
                                  <span>
                                    🏸 Cơ bản: {selectedGame.costPerMember.toLocaleString("vi-VN")}đ
                                  </span>
                                </div>
                                {customAmount > 0 && (
                                  <div className={`${styles.breakdownItem} ${styles.custom}`}>
                                    <span>
                                      ⚙️ Phí thêm: +{customAmount.toLocaleString("vi-VN")}đ
                                    </span>
                                  </div>
                                )}
                                <div className={`${styles.breakdownItem} ${styles.total}`}>
                                  <span>
                                    💰 Tổng phải trả: {(selectedGame.costPerMember + customAmount).toLocaleString("vi-VN")}đ
                                  </span>
                                </div>
                                {prePaid > 0 && (
                                  <div
                                    className={`${styles.breakdownItem} ${styles.prepaid}`}
                                  >
                                    <span>
                                      💸 Đã trả trước:{" "}
                                      {prePaid.toLocaleString("vi-VN")}đ
                                      {participant.prePaidCategory && (
                                        <span
                                          className={styles.prepaidCategory}
                                        >
                                          {" "}
                                          (
                                          {getCategoryIcon(
                                            participant.prePaidCategory
                                          )}{" "}
                                          {participant.prePaidCategory})
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                )}
                                <div
                                  className={`${styles.breakdownItem} ${
                                    remainingAmount >= 0
                                      ? styles.remaining
                                      : styles.overpaid
                                  }`}
                                >
                                  <span>
                                    {!participant.hasPaid ? (
                                      remainingAmount >= 0 ? (
                                        <>
                                          ⏳ Còn cần trả:{" "}
                                          <strong>
                                            {remainingAmount.toLocaleString(
                                              "vi-VN"
                                            )}
                                            đ
                                          </strong>
                                        </>
                                      ) : (
                                        <>
                                          🎉 Trả thừa:{" "}
                                          <strong>
                                            {Math.abs(
                                              remainingAmount
                                            ).toLocaleString("vi-VN")}
                                            đ
                                          </strong>
                                        </>
                                      )
                                    ) : null}
                                  </span>
                                </div>
                              </div>
                              {participant.hasPaid && participant.paidAt && (
                                <div className={styles.participantPaidTime}>
                                  💰 Đã trả lúc{" "}
                                  {new Date(
                                    participant.paidAt
                                  ).toLocaleDateString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              canEdit &&
                              handlePaymentToggle(
                                selectedGame.id,
                                participant.id,
                                participant.hasPaid || false
                              )
                            }
                            disabled={isLoading || !canEdit}
                            className={`${styles.paymentToggleModal} ${
                              participant.hasPaid ? styles.paid : styles.unpaid
                            } ${!canEdit ? styles.disabled : ""}`}
                            title={
                              !canEdit
                                ? "⚠️ Bạn không có quyền chỉnh sửa thanh toán"
                                : participant.hasPaid
                                ? `✅ ${participant.name} đã thanh toán - Nhấn để hủy`
                                : `💰 ${participant.name} chưa thanh toán - Nhấn để xác nhận đã trả`
                            }
                          >
                            {isLoading ? (
                              <div className={styles.paymentSpinner}></div>
                            ) : participant.hasPaid ? (
                              <>
                                <span className={styles.paymentIcon}>✅</span>
                                <span>Đã trả</span>
                                <div className={styles.paymentAmount}>
                                  {remainingAmount > 0
                                    ? `${remainingAmount.toLocaleString(
                                        "vi-VN"
                                      )}đ`
                                    : "Hoàn thành"}
                                </div>
                              </>
                            ) : (
                              <>
                                <span className={styles.paymentIcon}>⏳</span>
                                <span>Chưa trả</span>
                                <div className={styles.paymentAmount}>
                                  {remainingAmount.toLocaleString("vi-VN")}đ
                                </div>
                              </>
                            )}
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  {/* ✅ Updated Payment Summary in Modal */}
                  <div className={styles.modalPaymentSummary}>
                    {getGameTotalPrePaid(selectedGame) > 0 && (
                      <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>
                          💸 Tổng đã trả trước:
                        </span>
                        <span className={styles.summaryValue}>
                          {getGameTotalPrePaid(selectedGame).toLocaleString(
                            "vi-VN"
                          )}
                          đ
                        </span>
                      </div>
                    )}
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>
                        ✅ Đã thanh toán:
                      </span>
                      <span className={styles.summaryValue}>
                        {
                          selectedGame.participants.filter(p => p.hasPaid)
                            .length
                        }{" "}
                        người
                      </span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>
                        ⏳ Chưa thanh toán:
                      </span>
                      <span className={styles.summaryValue}>
                        {
                          selectedGame.participants.filter(p => !p.hasPaid)
                            .length
                        }{" "}
                        người
                      </span>
                    </div>
                    <div className={`${styles.summaryItem} ${styles.total}`}>
                      <span className={styles.summaryLabel}>
                        💰 Tổng đã thu:
                      </span>
                      <span className={styles.summaryValue}>
                        {(
                          getGameTotalPrePaid(selectedGame) +
                          selectedGame.participants
                            .filter(p => p.hasPaid)
                            .reduce(
                              (sum, p) =>
                                sum +
                                getMemberRemainingAmount(
                                  p,
                                  selectedGame.costPerMember
                                ),
                              0
                            )
                        ).toLocaleString("vi-VN")}
                        đ
                      </span>
                    </div>
                    <div
                      className={`${styles.summaryItem} ${styles.remaining}`}
                    >
                      <span className={styles.summaryLabel}>
                        ⏳ Còn cần thu:
                      </span>
                      <span className={styles.summaryValue}>
                        {selectedGame.participants
                          .filter(p => !p.hasPaid)
                          .reduce(
                            (sum, p) =>
                              sum +
                              getMemberRemainingAmount(
                                p,
                                selectedGame.costPerMember
                              ),
                            0
                          )
                          .toLocaleString("vi-VN")}
                        đ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Game Info */}
                <div className={styles.modalSection}>
                  <h4 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>ℹ️</span>
                    Thông Tin Bổ Sung
                  </h4>
                  <div className={styles.gameInfo}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>📅 Ngày chơi:</span>
                      <span className={styles.infoValue}>
                        {formatDate(selectedGame.date)}
                      </span>
                    </div>
                    {selectedGame.location && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>📍 Địa điểm:</span>
                        <span className={styles.infoValue}>
                          {selectedGame.location}
                        </span>
                      </div>
                    )}
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>📝 Ghi nhận:</span>
                      <span className={styles.infoValue}>
                        {new Date(selectedGame.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Game Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={handleCancelDeleteGame}
          onConfirm={handleConfirmDeleteGame}
          title='Xóa trận đấu'
          message={
            gameToDelete
              ? `Bạn có chắc muốn xóa trận đấu ngày ${gameToDelete.date} không? Tất cả dữ liệu thanh toán sẽ bị mất và không thể khôi phục.`
              : ""
          }
          confirmText='Xóa trận đấu'
          cancelText='Hủy bỏ'
          type='danger'
          isLoading={deleteLoading === gameToDelete?.id}
        />
      </div>
    </AuthorizedComponent>
  )
}

export default HistoryPage
