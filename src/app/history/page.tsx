"use client"
import React, { useEffect, useState } from "react"
import GameForm from "../../components/GameForm"
import { apiService } from "../../lib/api"

interface Member {
  id: string
  name: string
  phone?: string
  participantId?: string // For payment tracking
  hasPaid?: boolean // Payment status
  paidAt?: string // Payment timestamp
  prePaid?: number // ✅ Add pre-paid amount
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
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null)

  // ✅ Helper function to calculate remaining amount for a participant
  const getMemberRemainingAmount = (
    participant: Member,
    costPerMember: number
  ) => {
    const prePaid = participant.prePaid || 0
    return Math.max(0, costPerMember - prePaid)
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
      const data = await apiService.members.getAll()
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
  }

  const handleDeleteGame = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa trận đấu này không?")) {
      return
    }

    try {
      setDeleteLoading(id)
      await apiService.games.delete(id)
      await fetchGames()

      if (selectedGame?.id === id) {
        setSelectedGame(null)
      }
    } catch (error) {
      console.error("Error deleting game:", error)
      alert(error instanceof Error ? error.message : "Không thể xóa trận đấu")
    } finally {
      setDeleteLoading(null)
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
      alert("Không thể cập nhật trạng thái thanh toán")
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

  const stats = getTotalStats()

  if (loading) {
    return (
      <div className='history-loading'>
        <div className='loading-content'>
          <div className='loading-spinner'></div>
          <h2>Đang tải lịch sử trận đấu...</h2>
          <p>Vui lòng đợi một chút</p>
        </div>
      </div>
    )
  }

  return (
    <div className='history-page'>
      {/* Header Section */}
      <div className='history-header'>
        <div className='header-content'>
          <div className='header-info'>
            <div className='header-icon-wrapper'>
              <div className='header-icon'>🏸</div>
              <div className='icon-glow'></div>
            </div>
            <div className='header-text'>
              <h1 className='header-title'>Lịch Sử Trận Đấu</h1>
              <p className='header-subtitle'>
                Theo dõi và quản lý tất cả các trận cầu lông của bạn
              </p>
            </div>
          </div>

          <div className='header-actions'>
            {error && (
              <button
                onClick={fetchGames}
                className='action-btn retry-btn'
                disabled={loading}
              >
                {loading ? (
                  <div className='btn-spinner'></div>
                ) : (
                  <span className='btn-icon'>🔄</span>
                )}
                <span>Thử lại</span>
              </button>
            )}
            <button
              onClick={() => setShowForm(!showForm)}
              className={`action-btn primary-btn ${showForm ? "active" : ""}`}
              disabled={loading}
            >
              <span className='btn-icon'>{showForm ? "✕" : "➕"}</span>
              <span>{showForm ? "Hủy" : "Trận đấu mới"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className='history-container'>
        {/* Error Alert */}
        {error && (
          <div className='error-alert'>
            <div className='alert-content'>
              <div className='alert-icon'>⚠️</div>
              <div className='alert-text'>
                <strong>Có lỗi xảy ra:</strong> {error}
              </div>
            </div>
            <button onClick={() => setError("")} className='alert-close'>
              ✕
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className='stats-grid'>
          <div className='stat-card games-stat'>
            <div className='stat-icon'>🎯</div>
            <div className='stat-value'>{stats.totalGames}</div>
            <div className='stat-label'>Tổng trận đấu</div>
            <div className='stat-trend'>
              {stats.totalGames > 0 && (
                <span className='trend-text'>+{stats.totalGames} trận</span>
              )}
            </div>
          </div>

          <div className='stat-card cost-stat'>
            <div className='stat-icon'>💰</div>
            <div className='stat-value'>
              {stats.totalCost.toLocaleString("vi-VN")}đ
            </div>
            <div className='stat-label'>Tổng chi phí</div>
            <div className='stat-trend'>
              {stats.totalCost > 0 && (
                <span className='trend-text'>Đã chi tiêu</span>
              )}
            </div>
          </div>

          <div className='stat-card avg-stat'>
            <div className='stat-icon'>📊</div>
            <div className='stat-value'>
              {stats.avgCostPerGame.toLocaleString("vi-VN")}đ
            </div>
            <div className='stat-label'>TB mỗi trận</div>
            <div className='stat-trend'>
              {stats.avgCostPerGame > 0 && (
                <span className='trend-text'>Trung bình</span>
              )}
            </div>
          </div>

          <div className='stat-card players-stat'>
            <div className='stat-icon'>👥</div>
            <div className='stat-value'>{stats.totalParticipants}</div>
            <div className='stat-label'>Thành viên tham gia</div>
            <div className='stat-trend'>
              {stats.totalParticipants > 0 && (
                <span className='trend-text'>Duy nhất</span>
              )}
            </div>
          </div>
        </div>

        {/* Game Form */}
        {showForm && (
          <div className='form-section'>
            <div className='form-header'>
              <h2>🆕 Thêm Trận Đấu Mới</h2>
              <p>Ghi lại thông tin trận đấu và chi phí</p>
            </div>
            <GameForm members={members} onGameCreated={handleGameCreated} />
          </div>
        )}

        {/* Search and Filter */}
        {games.length > 0 && (
          <div className='search-section'>
            <div className='search-wrapper'>
              <div className='search-icon'>🔍</div>
              <input
                type='text'
                placeholder='Tìm kiếm theo ngày, địa điểm hoặc tên thành viên...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='search-input'
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className='search-clear'
                >
                  ✕
                </button>
              )}
            </div>
            {searchTerm && (
              <div className='search-results'>
                Tìm thấy {filteredGames.length} trận đấu
              </div>
            )}
          </div>
        )}

        {/* Games List */}
        {filteredGames.length === 0 ? (
          <div className='empty-state'>
            <div className='empty-icon'>🏸</div>
            <h3>
              {games.length === 0
                ? "Chưa có trận đấu nào"
                : "Không tìm thấy trận đấu nào"}
            </h3>
            <p>
              {games.length === 0
                ? "Hãy thêm trận đấu đầu tiên của bạn!"
                : "Thử tìm kiếm với từ khóa khác"}
            </p>
            {games.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className='empty-action-btn'
              >
                <span className='btn-icon'>➕</span>
                Thêm trận đấu đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className='games-section'>
            <div className='section-header'>
              <h2>📅 Danh Sách Trận Đấu</h2>
              <div className='games-count'>{filteredGames.length} trận đấu</div>
            </div>

            <div className='games-grid'>
              {filteredGames.map((game, index) => {
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
                    className='game-card'
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Game Header */}
                    <div className='game-header'>
                      <div className='game-date-info'>
                        <div className='game-date'>
                          {new Date(game.date).getDate()}
                        </div>
                        <div className='game-month'>
                          Tháng {new Date(game.date).getMonth() + 1}
                        </div>
                      </div>
                      <div className='game-title-info'>
                        <h3 className='game-title'>{formatDate(game.date)}</h3>
                        <p className='game-subtitle'>
                          {game.location && `📍 ${game.location} • `}
                          {game.participants.length} người tham gia
                        </p>
                      </div>
                    </div>

                    {/* Game Stats */}
                    <div className='game-stats'>
                      <div className='stat-item'>
                        <div className='stat-icon-small'>💰</div>
                        <div className='stat-info'>
                          <div className='stat-value-small'>
                            {game.totalCost.toLocaleString("vi-VN")}đ
                          </div>
                          <div className='stat-label-small'>Tổng chi phí</div>
                        </div>
                      </div>
                      <div className='stat-item'>
                        <div className='stat-icon-small'>👤</div>
                        <div className='stat-info'>
                          <div className='stat-value-small'>
                            {game.costPerMember.toLocaleString("vi-VN")}đ
                          </div>
                          <div className='stat-label-small'>Mỗi người</div>
                        </div>
                      </div>
                      {/* ✅ Add pre-pay info if exists */}
                      {totalPrePaid > 0 && (
                        <div className='stat-item'>
                          <div className='stat-icon-small'>💸</div>
                          <div className='stat-info'>
                            <div className='stat-value-small'>
                              {totalPrePaid.toLocaleString("vi-VN")}đ
                            </div>
                            <div className='stat-label-small'>Đã trả trước</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment Status */}
                    <div className='payment-status-card'>
                      <div className='payment-header'>
                        <span className='payment-title'>💰 Thanh toán</span>
                        <div className='payment-summary'>
                          <span
                            className={`payment-badge paid ${
                              paidCount > 0 ? "active" : ""
                            }`}
                          >
                            ✅ {paidCount}
                          </span>
                          <span
                            className={`payment-badge unpaid ${
                              unpaidCount > 0 ? "active" : ""
                            }`}
                          >
                            ⏳ {unpaidCount}
                          </span>
                        </div>
                      </div>

                      <div className='participants-payment-list'>
                        {game.participants.map(participant => {
                          const paymentKey = `${game.id}-${participant.id}`
                          const isLoading = paymentLoading === paymentKey
                          const remainingAmount = getMemberRemainingAmount(
                            participant,
                            game.costPerMember
                          )
                          const prePaid = participant.prePaid || 0

                          return (
                            <div
                              key={participant.id}
                              className={`participant-payment-item ${
                                participant.hasPaid ? "paid" : "unpaid"
                              }`}
                            >
                              <button
                                onClick={() =>
                                  handlePaymentToggle(
                                    game.id,
                                    participant.id,
                                    participant.hasPaid || false
                                  )
                                }
                                disabled={isLoading}
                                className='participant-payment-btn'
                                title={
                                  participant.hasPaid
                                    ? "Đã thanh toán - Click để đánh dấu chưa trả"
                                    : "Chưa thanh toán - Click để đánh dấu đã trả"
                                }
                              >
                                <div className='participant-avatar-small'>
                                  {participant.name.charAt(0).toUpperCase()}
                                </div>
                                <div className='participant-info-small'>
                                  <div className='participant-name-small'>
                                    {participant.name}
                                  </div>
                                  <div className='participant-amount'>
                                    {/* ✅ Show remaining amount instead of full cost */}
                                    {prePaid > 0 ? (
                                      <div className='amount-breakdown'>
                                        <div className='original-amount'>
                                          {game.costPerMember.toLocaleString(
                                            "vi-VN"
                                          )}
                                          đ
                                        </div>
                                        <div className='prepaid-amount'>
                                          -💸{prePaid.toLocaleString("vi-VN")}đ
                                        </div>
                                        <div className='remaining-amount'>
                                          ={" "}
                                          {remainingAmount.toLocaleString(
                                            "vi-VN"
                                          )}
                                          đ
                                        </div>
                                      </div>
                                    ) : (
                                      `${remainingAmount.toLocaleString(
                                        "vi-VN"
                                      )}đ`
                                    )}
                                  </div>
                                </div>
                                <div className='payment-status-icon'>
                                  {isLoading ? (
                                    <div className='payment-spinner'></div>
                                  ) : participant.hasPaid ? (
                                    <span className='paid-icon'>✅</span>
                                  ) : (
                                    <span className='unpaid-icon'>⏳</span>
                                  )}
                                </div>
                              </button>
                              {participant.hasPaid && participant.paidAt && (
                                <div className='payment-time'>
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
                          )
                        })}
                      </div>

                      {/* ✅ Updated payment total to show correct amounts */}
                      <div className='payment-totals'>
                        {totalPrePaid > 0 && (
                          <div className='payment-total prepaid'>
                            <span className='total-label'>
                              💸 Đã trả trước:
                            </span>
                            <span className='total-amount'>
                              {totalPrePaid.toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                        )}
                        {paidCount > 0 && (
                          <div className='payment-total collected'>
                            <span className='total-label'>✅ Đã thu thêm:</span>
                            <span className='total-amount'>
                              {totalCollectedFromPaid.toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                        )}
                        <div className='payment-total remaining'>
                          <span className='total-label'>⏳ Còn cần thu:</span>
                          <span className='total-amount'>
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
                    <div className='game-actions'>
                      <button
                        onClick={() => setSelectedGame(game)}
                        className='game-action-btn view-btn'
                        title='Xem chi tiết'
                      >
                        <span className='btn-icon'>👁️</span>
                        <span>Chi tiết</span>
                      </button>
                    </div>

                    {/* Game Card Glow Effect */}
                    <div className='card-glow'></div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Game Detail Modal */}
      {selectedGame && (
        <div className='modal-overlay'>
          <div className='modal-content'>
            <div className='modal-header'>
              <div className='modal-title-section'>
                <div className='modal-icon'>🏸</div>
                <div>
                  <h3 className='modal-title'>Chi Tiết Trận Đấu</h3>
                  <p className='modal-subtitle'>
                    {formatDate(selectedGame.date)}
                    {selectedGame.location && ` • ${selectedGame.location}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedGame(null)}
                className='modal-close'
              >
                ✕
              </button>
            </div>

            <div className='modal-body'>
              {/* Cost Breakdown */}
              <div className='modal-section'>
                <h4 className='section-title'>
                  <span className='section-icon'>💰</span>
                  Chi Phí Chi Tiết
                </h4>
                <div className='cost-breakdown'>
                  <div className='cost-item'>
                    <span className='cost-label'>🏟️ Thuê sân:</span>
                    <span className='cost-value'>
                      {selectedGame.yardCost.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className='cost-item'>
                    <span className='cost-label'>
                      🏸 Cầu lông ({selectedGame.shuttleCockQuantity} quả):
                    </span>
                    <span className='cost-value'>
                      {(
                        selectedGame.shuttleCockQuantity *
                        selectedGame.shuttleCockPrice
                      ).toLocaleString("vi-VN")}
                      đ
                    </span>
                  </div>
                  <div className='cost-item'>
                    <span className='cost-label'>📋 Chi phí khác:</span>
                    <span className='cost-value'>
                      {selectedGame.otherFees.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className='cost-total'>
                    <span className='total-label'>Tổng cộng:</span>
                    <span className='total-value'>
                      {selectedGame.totalCost.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className='cost-per-member'>
                    <span className='per-member-label'>Mỗi người:</span>
                    <span className='per-member-value'>
                      {selectedGame.costPerMember.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  {/* ✅ Add pre-pay breakdown in modal */}
                  {getGameTotalPrePaid(selectedGame) > 0 && (
                    <div className='prepay-breakdown'>
                      <div className='cost-item prepay'>
                        <span className='cost-label'>
                          💸 Tổng đã trả trước:
                        </span>
                        <span className='cost-value'>
                          -
                          {getGameTotalPrePaid(selectedGame).toLocaleString(
                            "vi-VN"
                          )}
                          đ
                        </span>
                      </div>
                      <div className='cost-item remaining'>
                        <span className='cost-label'>⏳ Tổng còn cần thu:</span>
                        <span className='cost-value'>
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

              {/* Participants with Payment Status */}
              <div className='modal-section'>
                <h4 className='section-title'>
                  <span className='section-icon'>👥</span>
                  Thành Viên Tham Gia ({selectedGame.participants.length})
                </h4>
                <div className='participants-list'>
                  {selectedGame.participants.map(participant => {
                    const paymentKey = `${selectedGame.id}-${participant.id}`
                    const isLoading = paymentLoading === paymentKey
                    const remainingAmount = getMemberRemainingAmount(
                      participant,
                      selectedGame.costPerMember
                    )
                    const prePaid = participant.prePaid || 0

                    return (
                      <div
                        key={participant.id}
                        className={`participant-item-modal ${
                          participant.hasPaid ? "paid" : "unpaid"
                        }`}
                      >
                        <div className='participant-info-wrapper'>
                          <div className='participant-avatar-large'>
                            {participant.name.charAt(0).toUpperCase()}
                          </div>
                          <div className='participant-info'>
                            <div className='participant-name'>
                              {participant.name}
                            </div>
                            {participant.phone && (
                              <div className='participant-phone'>
                                📱 {participant.phone}
                              </div>
                            )}
                            {/* ✅ Show payment breakdown in modal */}
                            <div className='participant-payment-breakdown'>
                              <div className='breakdown-item'>
                                <span>
                                  💰 Phải trả:{" "}
                                  {selectedGame.costPerMember.toLocaleString(
                                    "vi-VN"
                                  )}
                                  đ
                                </span>
                              </div>
                              {prePaid > 0 && (
                                <div className='breakdown-item prepaid'>
                                  <span>
                                    💸 Đã trả trước:{" "}
                                    {prePaid.toLocaleString("vi-VN")}đ
                                  </span>
                                </div>
                              )}
                              <div className='breakdown-item remaining'>
                                <span>
                                  ⏳ Còn cần trả:{" "}
                                  <strong>
                                    {remainingAmount.toLocaleString("vi-VN")}đ
                                  </strong>
                                </span>
                              </div>
                            </div>
                            {participant.hasPaid && participant.paidAt && (
                              <div className='participant-paid-time'>
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
                            handlePaymentToggle(
                              selectedGame.id,
                              participant.id,
                              participant.hasPaid || false
                            )
                          }
                          disabled={isLoading}
                          className={`payment-toggle-modal ${
                            participant.hasPaid ? "paid" : "unpaid"
                          }`}
                          title={
                            participant.hasPaid
                              ? "Đã thanh toán - Click để đánh dấu chưa trả"
                              : "Chưa thanh toán - Click để đánh dấu đã trả"
                          }
                        >
                          {isLoading ? (
                            <div className='payment-spinner'></div>
                          ) : participant.hasPaid ? (
                            <>
                              <span className='payment-icon'>✅</span>
                              <span>Đã trả</span>
                              <div className='payment-amount'>
                                {remainingAmount > 0
                                  ? `${remainingAmount.toLocaleString(
                                      "vi-VN"
                                    )}đ`
                                  : "Hoàn thành"}
                              </div>
                            </>
                          ) : (
                            <>
                              <span className='payment-icon'>⏳</span>
                              <span>Chưa trả</span>
                              <div className='payment-amount'>
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
                <div className='modal-payment-summary'>
                  {getGameTotalPrePaid(selectedGame) > 0 && (
                    <div className='summary-item'>
                      <span className='summary-label'>
                        💸 Tổng đã trả trước:
                      </span>
                      <span className='summary-value'>
                        {getGameTotalPrePaid(selectedGame).toLocaleString(
                          "vi-VN"
                        )}
                        đ
                      </span>
                    </div>
                  )}
                  <div className='summary-item'>
                    <span className='summary-label'>✅ Đã thanh toán:</span>
                    <span className='summary-value'>
                      {selectedGame.participants.filter(p => p.hasPaid).length}{" "}
                      người
                    </span>
                  </div>
                  <div className='summary-item'>
                    <span className='summary-label'>⏳ Chưa thanh toán:</span>
                    <span className='summary-value'>
                      {selectedGame.participants.filter(p => !p.hasPaid).length}{" "}
                      người
                    </span>
                  </div>
                  <div className='summary-item total'>
                    <span className='summary-label'>💰 Tổng đã thu:</span>
                    <span className='summary-value'>
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
                  <div className='summary-item remaining'>
                    <span className='summary-label'>⏳ Còn cần thu:</span>
                    <span className='summary-value'>
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
              <div className='modal-section'>
                <h4 className='section-title'>
                  <span className='section-icon'>ℹ️</span>
                  Thông Tin Bổ Sung
                </h4>
                <div className='game-info'>
                  <div className='info-item'>
                    <span className='info-label'>📅 Ngày chơi:</span>
                    <span className='info-value'>
                      {formatDate(selectedGame.date)}
                    </span>
                  </div>
                  {selectedGame.location && (
                    <div className='info-item'>
                      <span className='info-label'>📍 Địa điểm:</span>
                      <span className='info-value'>
                        {selectedGame.location}
                      </span>
                    </div>
                  )}
                  <div className='info-item'>
                    <span className='info-label'>📝 Ghi nhận:</span>
                    <span className='info-value'>
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
    </div>
  )
}

export default HistoryPage
