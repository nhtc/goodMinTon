"use client"
import React, {useState, useEffect} from "react"
import {useSearchParams} from "next/navigation"
import Link from "next/link"
import styles from "./page.module.css"
import {useToast} from "../../context/ToastContext"
import {useMemberPaymentInfo, useBulkPaymentOperation, useActiveMembers} from "../../hooks/useQueries"
import MemberAutocomplete from "../../components/MemberAutocomplete"
import ConfirmationModal from "../../components/ConfirmationModal"
import {useAuth} from "../../context/AuthContext"
import type {Member, PersonalEvent, PersonalEventParticipant} from "../../types"

// Type guard function
const isValidPersonalEvent = (event: any): event is PersonalEvent => {
  return event && typeof event === 'object' && 'id' in event && 'participants' in event && Array.isArray(event.participants)
}

interface PaymentInfo {
  bankName: string
  accountNumber: string
  accountHolder: string
  amount?: number
  content?: string
}

interface GameParticipant {
  id: string // This is the member's ID (from member object)
  name: string
  phone?: string
  participantId: string // This is the participation record ID
  hasPaid: boolean
  paidAt?: string
  prePaid: number
}

interface Game {
  id: string
  date: string
  costPerMember: number
  participants: GameParticipant[]
}

// Personal Event interfaces

const PaymentPageContent = () => {
  const searchParams = useSearchParams()
  const {showWarning, showError} = useToast()
  const {isAuthenticated} = useAuth()

  // React Query hooks - these will cache the data
  const {
    data: members = [],
    isLoading: membersLoading,
    error: membersError
  } = useActiveMembers()

  // Bulk payment operation hook
  const bulkPaymentMutation = useBulkPaymentOperation()

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    bankName: "Vietcombank",
    accountNumber: "9937822899",
    accountHolder: "NGUYEN HOANG TUAN CUONG",
    content: "Thanh toan cau long",
  })

  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [copySuccess, setCopySuccess] = useState<string>("")
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isChangingMember, setIsChangingMember] = useState<boolean>(false)
  const [showAllGames, setShowAllGames] = useState<boolean>(false)
  const [showAllPersonalEvents, setShowAllPersonalEvents] = useState<boolean>(false)

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    operation: 'mark_all_paid' | 'mark_all_unpaid'
    type: 'games' | 'personal_events' | 'both'
    confirmText: string
  }>({
    isOpen: false,
    title: '',
    message: '',
    operation: 'mark_all_paid',
    type: 'games',
    confirmText: ''
  })

  // Use the new backend API to get payment info (replaces frontend calculation)
  const {
    data: paymentInfoData,
    isLoading: paymentInfoLoading,
    error: paymentInfoError,
    isFetching: paymentInfoFetching
  } = useMemberPaymentInfo(selectedMember?.id || null)

  // Extract data from the backend response
  const memberOutstandingAmount = paymentInfoData?.games.totalUnpaid || 0
  const unpaidGames = paymentInfoData?.games.unpaidGames || []
  const memberPersonalEventsAmount = paymentInfoData?.personalEvents.totalUnpaid || 0
  const unpaidPersonalEvents = paymentInfoData?.personalEvents.unpaidEvents || []

  // Handle members loading error
  const error = membersError ? 'Failed to load members' : null
  const loading = membersLoading

  // Combined loading state for better UX
  const isCalculatingAmount = paymentInfoLoading || paymentInfoFetching || isChangingMember

  // Toggle function for showing all games
  const toggleShowAllGames = () => {
    setShowAllGames(prev => !prev)
  }

  // Toggle function for showing all personal events
  const toggleShowAllPersonalEvents = () => {
    setShowAllPersonalEvents(prev => !prev)
  }

  // Bulk payment handlers
  const executeBulkPaymentOperation = async (
    operation: 'mark_all_paid' | 'mark_all_unpaid',
    type: 'games' | 'personal_events' | 'both'
  ) => {
    if (!selectedMember) {
      showWarning("Thông tin thiếu", "Vui lòng chọn thành viên")
      return
    }

    try {
      const result = await bulkPaymentMutation.mutateAsync({
        memberId: selectedMember.id,
        operation,
        type
      })

      const operationText = operation === 'mark_all_paid' ? 'đã thanh toán' : 'chưa thanh toán'
      const typeText = type === 'games' ? 'trận cầu lông' : type === 'personal_events' ? 'sự kiện cá nhân' : 'tất cả'

      if (result.updates.totalUpdated > 0) {
        showWarning(
          "Cập nhật thành công",
          `Đã đánh dấu ${result.updates.totalUpdated} mục ${typeText} là ${operationText}`
        )
      } else {
        showWarning(
          "Không có gì thay đổi",
          `Không có mục nào cần cập nhật trạng thái`
        )
      }

      // Close the confirmation modal
      setConfirmationModal(prev => ({...prev, isOpen: false}))
    } catch (error) {
      showError("Lỗi", "Không thể cập nhật trạng thái thanh toán")
      console.error('Bulk payment operation failed:', error)
      // Close the confirmation modal on error too
      setConfirmationModal(prev => ({...prev, isOpen: false}))
    }
  }

  const showBulkPaymentConfirmation = (
    operation: 'mark_all_paid' | 'mark_all_unpaid',
    type: 'games' | 'personal_events' | 'both'
  ) => {
    if (!isAuthenticated) {
      showWarning("Cần đăng nhập", "Vui lòng đăng nhập để sử dụng chức năng thanh toán hàng loạt")
      return
    }

    if (!selectedMember) {
      showWarning("Thông tin thiếu", "Vui lòng chọn thành viên")
      return
    }

    // Calculate counts for the confirmation message
    let gameCount = 0
    let eventCount = 0

    if (type === 'games' || type === 'both') {
      gameCount = unpaidGames.length
    }

    if (type === 'personal_events' || type === 'both') {
      eventCount = unpaidPersonalEvents.length
    }

    // Generate confirmation message
    const operationText = operation === 'mark_all_paid' ? 'đã thanh toán' : 'chưa thanh toán'
    const isPaid = operation === 'mark_all_paid'

    let title = ''
    let message = ''
    let confirmText = ''

    if (type === 'games') {
      title = `Xác nhận ${isPaid ? 'đánh dấu đã thanh toán' : 'đánh dấu chưa thanh toán'}`
      message = `Bạn có chắc chắn muốn đánh dấu ${gameCount} trận cầu lông là ${operationText} cho ${selectedMember.name}?`
      confirmText = isPaid ? 'Đánh dấu đã thanh toán' : 'Đánh dấu chưa thanh toán'
    } else if (type === 'personal_events') {
      title = `Xác nhận ${isPaid ? 'đánh dấu đã thanh toán' : 'đánh dấu chưa thanh toán'}`
      message = `Bạn có chắc chắn muốn đánh dấu ${eventCount} sự kiện cá nhân là ${operationText} cho ${selectedMember.name}?`
      confirmText = isPaid ? 'Đánh dấu đã thanh toán' : 'Đánh dấu chưa thanh toán'
    } else {
      title = `Xác nhận ${isPaid ? 'đánh dấu đã thanh toán' : 'đánh dấu chưa thanh toán'}`
      message = `Bạn có chắc chắn muốn đánh dấu ${gameCount} trận cầu lông và ${eventCount} sự kiện cá nhân là ${operationText} cho ${selectedMember.name}?`
      confirmText = isPaid ? 'Đánh dấu tất cả đã thanh toán' : 'Đánh dấu tất cả chưa thanh toán'
    }

    setConfirmationModal({
      isOpen: true,
      title,
      message,
      operation,
      type,
      confirmText
    })
  }

  const handleMarkAllGamesPaid = () => showBulkPaymentConfirmation('mark_all_paid', 'games')
  const handleMarkAllPersonalEventsPaid = () => showBulkPaymentConfirmation('mark_all_paid', 'personal_events')
  const handleMarkAllPaid = () => showBulkPaymentConfirmation('mark_all_paid', 'both')

  const handleConfirmBulkPayment = () => {
    executeBulkPaymentOperation(confirmationModal.operation, confirmationModal.type)
  }

  const handleCloseConfirmationModal = () => {
    setConfirmationModal(prev => ({...prev, isOpen: false}))
  }

  // Handler for member selection with smooth loading transition
  const handleMemberChange = async (memberId: string) => {
    const member = members.find((m: Member) => m.id === memberId)

    if (!member) {
      setSelectedMember(null)
      setIsChangingMember(false)
      return
    }

    // Set changing state immediately for smooth UX
    setIsChangingMember(true)

    // Small delay to prevent flash and show loading state
    setTimeout(() => {
      setSelectedMember(member)
      // Reset changing state after a minimum display time
      setTimeout(() => {
        setIsChangingMember(false)
      }, 300) // Minimum loading display time
    }, 100)
  }

  // Handler for autocomplete component that accepts Member object
  const handleAutocompleteChange = (member: any) => {
    if (!member) {
      setSelectedMember(null)
      setIsChangingMember(false)
      setShowAllGames(false) // Reset show all games when member changes
      return
    }

    // Set changing state immediately for smooth UX
    setIsChangingMember(true)
    setShowAllGames(false) // Reset show all games when member changes

    // Small delay to prevent flash and show loading state
    setTimeout(() => {
      setSelectedMember(member)
      // Reset changing state after a minimum display time
      setTimeout(() => {
        setIsChangingMember(false)
      }, 300) // Minimum loading display time
    }, 100)
  }

  // Update payment info when member is selected - combines both badminton and personal events
  useEffect(() => {
    if (selectedMember) {
      const totalBadmintonAmount = memberOutstandingAmount || 0
      const totalPersonalEventsAmount = memberPersonalEventsAmount || 0
      const totalAmount = totalBadmintonAmount + totalPersonalEventsAmount

      if (totalAmount > 0) {
        // Generate payment content with current date
        const currentDate = new Date()
        const day = currentDate.getDate().toString().padStart(2, '0')
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0')
        const year = currentDate.getFullYear()

        let paymentContent = `${selectedMember.name.toUpperCase()} - Thanh toan toi ngay ${day}.${month}.${year}`

        setPaymentInfo(prev => ({
          ...prev,
          amount: totalAmount,
          content: paymentContent,
        }))
      }
    }
  }, [selectedMember, memberOutstandingAmount, memberPersonalEventsAmount, unpaidGames, unpaidPersonalEvents])  // Get amount and content from URL params (fallback if no member selected)

  useEffect(() => {
    const amount = searchParams.get("amount")
    const content = searchParams.get("content") || searchParams.get("message")
    const gameId = searchParams.get("gameId")
    const memberName = searchParams.get("memberName")

    if (selectedMember) return // Don't override if member is selected

    if (amount) {
      setPaymentInfo(prev => ({...prev, amount: parseInt(amount)}))
    }

    if (content || gameId || memberName) {
      let paymentContent = content || "Thanh toan cau long"
      if (gameId && memberName) {
        paymentContent = `CL ${gameId.slice(-4)} ${memberName}`
      } else if (gameId) {
        paymentContent = `Cau long game ${gameId.slice(-4)}`
      } else if (memberName) {
        paymentContent = `CL ${memberName}`
      }
      setPaymentInfo(prev => ({...prev, content: paymentContent}))
    }
  }, [searchParams, selectedMember])

  // Generate QR Code URL
  useEffect(() => {
    const generateQRCode = () => {
      // Using VietQR format
      const vietQRData = {
        bankCode: "970436", // Vietcombank code
        accountNumber: paymentInfo.accountNumber,
        amount: paymentInfo.amount || "",
        content: paymentInfo.content || "",
        accountHolder: paymentInfo.accountHolder,
      }

      // Create QR data string
      const qrData = `https://qr.sepay.vn/img?acc=${vietQRData.accountNumber
        }&bank=${vietQRData.bankCode}&amount=${vietQRData.amount
        }&des=${encodeURIComponent(vietQRData.content)}`

      setQrCodeUrl(qrData)
    }

    generateQRCode()
  }, [paymentInfo])

  // Generate banking app URL for direct payment
  const generateBankingAppUrl = (amount?: number, content?: string): string => {
    // Default to combined amount if no parameters provided
    const paymentAmount = amount || ((memberOutstandingAmount || 0) + (memberPersonalEventsAmount || 0))

    // Generate default content if not provided
    let paymentContent = content
    if (!paymentContent && selectedMember) {
      const currentDate = new Date()
      const day = currentDate.getDate().toString().padStart(2, '0')
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0')
      const year = currentDate.getFullYear()
      paymentContent = `${selectedMember.name.toUpperCase()} - Thanh toan toi ngay ${day}.${month}.${year}`
    }

    if (!paymentContent) {
      paymentContent = "Thanh toan"
    }

    if (!selectedMember || paymentAmount === 0) return "#"    // VietQR format that works with most Vietnamese banking apps
    const vietQRUrl = `https://qr.sepay.vn/img?acc=${paymentInfo.accountNumber
      }&bank=970436&amount=${paymentAmount}&des=${encodeURIComponent(paymentContent)}`

    // Try to detect the user's banking app and use deep linking
    // For mobile devices, we can use intent URLs that will open the banking app
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /android|iphone|ipad|ipod|mobile/.test(userAgent)

    if (isMobile) {
      // For mobile, use intent URL that will prompt to open banking app
      return `intent://payment?bank=970436&account=${paymentInfo.accountNumber
        }&amount=${paymentAmount}&content=${encodeURIComponent(
          paymentContent
        )}#Intent;scheme=vietqr;package=com.vietcombank.mobile;end`
    }

    return vietQRUrl
  }

  /**
   * Handles opening banking app with appropriate payment information
   * Supports both game and personal event payments
   */

  const openBankingApp = () => {
    if (!selectedMember) {
      showWarning("Thông tin thiếu", "Vui lòng chọn thành viên cần thanh toán")
      return
    }

    const totalBadmintonAmount = memberOutstandingAmount || 0
    const totalPersonalEventsAmount = memberPersonalEventsAmount || 0
    const totalAmount = totalBadmintonAmount + totalPersonalEventsAmount

    if (totalAmount === 0) {
      showWarning("Thông tin thiếu", "Thành viên không có khoản nào cần thanh toán")
      return
    }

    // Generate payment content with current date
    const currentDate = new Date()
    const day = currentDate.getDate().toString().padStart(2, '0')
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0')
    const year = currentDate.getFullYear()

    let content = `${selectedMember.name.toUpperCase()} - Thanh toan toi ngay ${day}.${month}.${year}`

    const bankingUrl = generateBankingAppUrl(totalAmount, content)
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /android|iphone|ipad|ipod|mobile/.test(userAgent)

    try {
      if (isMobile) {
        // For mobile, try to open banking app first, fallback to browser
        window.location.href = bankingUrl

        // Fallback: If banking app is not installed, open browser after delay
        setTimeout(() => {
          const fallbackUrl = `https://qr.sepay.vn/img?acc=${paymentInfo.accountNumber
            }&bank=970436&amount=${totalAmount}&des=${encodeURIComponent(content)}`
          window.open(fallbackUrl, "_blank")
        }, 1500)
      } else {
        // For desktop, open QR page in new tab
        const fallbackUrl = `https://qr.sepay.vn/img?acc=${paymentInfo.accountNumber
          }&bank=970436&amount=${totalAmount}&des=${encodeURIComponent(content)}`
        window.open(fallbackUrl, "_blank")
      }
    } catch (error) {
      console.error("Error opening banking app:", error)
      // Final fallback - copy payment info to clipboard
      const paymentDetails = `
Ngân hàng: ${paymentInfo.bankName}
Số tài khoản: ${paymentInfo.accountNumber}
Chủ tài khoản: ${paymentInfo.accountHolder}
Số tiền: ${formatCurrency(totalAmount)}
Nội dung: ${content}
      `.trim()

      copyToClipboard(paymentDetails, "paymentDetails")
      showError(
        "Không thể mở ứng dụng",
        "Không thể mở ứng dụng ngân hàng. Thông tin thanh toán đã được sao chép vào clipboard."
      )
    }
  }

  /**
   * Copies text to clipboard with error handling
   * @param text - Text to copy to clipboard
   * @param type - Type identifier for UI feedback
   */
  const copyToClipboard = async (text: string, type: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(type)
      setTimeout(() => setCopySuccess(""), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
      setCopySuccess("error")
      setTimeout(() => setCopySuccess(""), 2000)
    }
  }

  /**
   * Formats number to Vietnamese currency format
   * @param amount - Amount to format (in VND)
   * @returns Formatted currency string (e.g., "500.000đ" for 500,000 VND)
   */
  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString("vi-VN")}đ`
  }

  /**
   * Generates optimized payment content for game payments
   * @param member - The member making the payment
   * @param games - Array of unpaid games
   * @returns Formatted payment content string optimized for QR codes
   */
  const generatePaymentContent = (member: Member, games: Game[]): string => {
    if (!member || games.length === 0) return "Thanh toan cau long"

    // Get the most recent game date to use as "den ngay" (until date)
    const sortedGames = games.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const latestGame = sortedGames[0]
    const gameDate = new Date(latestGame.date)
    const day = gameDate.getDate()
    const month = gameDate.getMonth() + 1 // getMonth() returns 0-11, so add 1

    // Shorter format: "Thanh toan den ngay DD.MM" - optimized for QR code
    let content = `${member.name.toUpperCase()} - CL -> ${day}.${month}`

    // Ensure content is not too long for QR code (max ~25 characters for better QR generation)
    if (content.length > 25) {
      // Ultra short fallback: "TT den DD.MM"
      content = `${member.name.toUpperCase()} - CL -> ${day}.${month}`
    }

    return content
  }

  return (
    <div className={styles.paymentPage}>
      {/* Background Pattern */}
      <div className={styles.backgroundPattern}>
        <div className={styles.bgCircle1}></div>
        <div className={styles.bgCircle2}></div>
      </div>

      <div className={styles.container}>
        {/* Back Navigation */}
        <div className={styles.backToHome}>
          <Link href='/history' className={styles.backLink}>
            <span className={styles.backArrow}>←</span>
            Quay lại lịch sử
          </Link>
        </div>

        {/* Payment Card */}
        <div className={styles.paymentCard}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.iconContainer}>
              <span className={styles.icon} title='Payment QR Code'>
                💳
              </span>
            </div>
            <h1 className={styles.title}>Thanh Toán QR</h1>
            <p className={styles.subtitle}>
              Chọn thành viên và quét mã QR để thanh toán cầu lông + sự kiện cá nhân
            </p>
          </div>

          {/* Member Selection */}
          <div className={styles.memberSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>👤</span>
              Chọn thành viên
              {!membersLoading && members.length > 0 && !isCalculatingAmount && (
                <span className={styles.cacheIndicator} title="Dữ liệu đã được cache - thao tác nhanh hơn">
                  ⚡
                </span>
              )}
              {isCalculatingAmount && (
                <span className={styles.calculatingIndicatorTitle} title="Đang xử lý...">
                  <div className={styles.miniLoadingSpinner}></div>
                </span>
              )}
            </h3>

            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.loadingSpinner}></div>
                <p>Đang tải danh sách thành viên...</p>
              </div>
            ) : error ? (
              <div className={styles.errorState}>
                <span className={styles.errorIcon}>⚠️</span>
                <p>{error}</p>
              </div>
            ) : (
              <div className={styles.memberSelector}>
                <MemberAutocomplete
                  members={members}
                  selectedMember={selectedMember}
                  onMemberChange={handleAutocompleteChange}
                  placeholder="Tìm kiếm thành viên theo tên hoặc số điện thoại..."
                  disabled={isChangingMember}
                  isLoading={isChangingMember}
                />

                {selectedMember && (
                  <div className={styles.memberInfo}>
                    {isCalculatingAmount ? (
                      <div className={styles.memberCalculatingState}>
                        <div className={styles.memberCalculatingContent}>
                          <div className={styles.memberPreview}>
                            <div className={styles.memberName}>
                              <span className={styles.memberIcon}>👤</span>
                              <strong>{selectedMember.name}</strong>
                            </div>
                            {selectedMember.phone && (
                              <div className={styles.memberPhone}>
                                <span className={styles.phoneIcon}>📱</span>
                                {selectedMember.phone}
                              </div>
                            )}
                          </div>
                          <div className={styles.calculatingIndicator}>
                            <div className={styles.loadingSpinner}></div>
                            <p>
                              {isChangingMember
                                ? "Đang chọn thành viên..."
                                : "Đang tính toán số tiền cần thanh toán..."
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : paymentInfoError ? (
                      <div className={styles.errorState}>
                        <span className={styles.errorIcon}>⚠️</span>
                        <p>Không thể tính toán số tiền cần thanh toán</p>
                      </div>
                    ) : (
                      <div className={styles.memberDetails}>
                        <div className={styles.memberName}>
                          <span className={styles.memberIcon}>👤</span>
                          <strong>{selectedMember.name}</strong>
                        </div>
                        {selectedMember.phone && (
                          <div className={styles.memberPhone}>
                            <span className={styles.phoneIcon}>📱</span>
                            {selectedMember.phone}
                          </div>
                        )}
                        <div className={styles.memberAmount}>
                          <span className={styles.amountIcon}>💰</span>
                          <span className={styles.amountLabel}>
                            Số tiền cần thanh toán:
                          </span>
                          <span className={styles.amountValue}>
                            {formatCurrency((memberOutstandingAmount || 0) + (memberPersonalEventsAmount || 0))}
                          </span>
                        </div>

                        {/* Combined Breakdown */}
                        {(unpaidGames.length > 0 || unpaidPersonalEvents.length > 0) && (
                          <div className={styles.unpaidGamesBreakdown}>
                            {/* Badminton Games Breakdown */}
                            {unpaidGames.length > 0 && (
                              <>
                                <div className={styles.breakdownHeader}>
                                  <span className={styles.breakdownIcon}>🏸</span>
                                  <span className={styles.breakdownTitle}>
                                    Cầu lông - {unpaidGames.length} trận chưa thanh toán: {formatCurrency(memberOutstandingAmount)}
                                  </span>
                                </div>

                                {/* Bulk Actions for Badminton Games */}
                                {isAuthenticated && (
                                  <div className={styles.bulkActions}>
                                    <button
                                      onClick={handleMarkAllGamesPaid}
                                      disabled={bulkPaymentMutation.isPending}
                                      className={`${styles.bulkActionBtn} ${styles.markPaidBtn}`}
                                      title="Đánh dấu tất cả trận cầu lông đã thanh toán"
                                    >
                                      <span className={styles.bulkActionIcon}>✅</span>
                                      <span className={styles.bulkActionText}>
                                        {bulkPaymentMutation.isPending ? 'Đang xử lý...' : 'Đánh dấu tất cả đã thanh toán'}
                                      </span>
                                    </button>
                                  </div>
                                )}
                                <div className={styles.gamesList}>
                                  {(showAllGames ? unpaidGames : unpaidGames.slice(0, 3)).map((game: any, index: number) => {
                                    // Backend already calculated the outstanding amount
                                    const gameAmount = game.outstandingAmount
                                    const gameDate = new Date(game.date).toLocaleDateString("vi-VN", {
                                      weekday: "short",
                                      day: "2-digit",
                                      month: "2-digit"
                                    })

                                    return (
                                      <div key={game.id} className={styles.gameItem}>
                                        <span className={styles.gameDate}>📅 {gameDate}</span>
                                        <span className={styles.gameAmount}>
                                          {formatCurrency(gameAmount)}
                                        </span>
                                      </div>
                                    )
                                  })}
                                  {unpaidGames.length > 3 && (
                                    <div className={styles.showMoreContainer}>
                                      {!showAllGames && (
                                        <div className={styles.moreGames}>
                                          + {unpaidGames.length - 3} trận khác...
                                        </div>
                                      )}
                                      <button
                                        onClick={toggleShowAllGames}
                                        className={styles.showAllButton}
                                        title={showAllGames ? 'Thu gọn danh sách' : 'Hiển thị tất cả trận đấu'}
                                      >
                                        <span className={styles.showAllIcon}>
                                          {showAllGames ? '⬆️' : '⬇️'}
                                        </span>
                                        <span className={styles.showAllText}>
                                          {showAllGames ? 'Thu gọn' : 'Xem tất cả'}
                                        </span>
                                        <span className={styles.showAllCount}>
                                          ({unpaidGames.length})
                                        </span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                            <br />
                            <br />
                            {/* Personal Events Breakdown */}
                            {unpaidPersonalEvents.length > 0 && (
                              <>
                                <div className={styles.breakdownHeader}>
                                  <span className={styles.breakdownIcon}>🎉</span>
                                  <span className={styles.breakdownTitle}>
                                    Sự kiện cá nhân - {unpaidPersonalEvents.length} sự kiện chưa thanh toán: {formatCurrency(memberPersonalEventsAmount)}
                                  </span>
                                </div>

                                {/* Bulk Actions for Personal Events */}
                                {isAuthenticated && (
                                  <div className={styles.bulkActions}>
                                    <button
                                      onClick={handleMarkAllPersonalEventsPaid}
                                      disabled={bulkPaymentMutation.isPending}
                                      className={`${styles.bulkActionBtn} ${styles.markPaidBtn}`}
                                      title="Đánh dấu tất cả sự kiện cá nhân đã thanh toán"
                                    >
                                      <span className={styles.bulkActionIcon}>✅</span>
                                      <span className={styles.bulkActionText}>
                                        {bulkPaymentMutation.isPending ? 'Đang xử lý...' : 'Đánh dấu tất cả đã thanh toán'}
                                      </span>
                                    </button>
                                  </div>
                                )}
                                <div className={styles.gamesList}>
                                  {(showAllPersonalEvents ? unpaidPersonalEvents : unpaidPersonalEvents.slice(0, 3)).map((event: any, index: number) => {
                                    // Backend already calculated the outstanding amount
                                    const eventAmount = event.outstandingAmount
                                    const eventDate = new Date(event.date).toLocaleDateString("vi-VN", {
                                      weekday: "short",
                                      day: "2-digit",
                                      month: "2-digit"
                                    })

                                    return (
                                      <div key={event.id} className={styles.gameItem}>
                                        <span className={styles.gameDate}>📅 {eventDate} - {event.title}</span>
                                        <span className={styles.gameAmount}>
                                          {formatCurrency(eventAmount)}
                                        </span>
                                      </div>
                                    )
                                  })}
                                  {unpaidPersonalEvents.length > 3 && (
                                    <div className={styles.showMoreContainer}>
                                      {!showAllPersonalEvents && (
                                        <div className={styles.moreGames}>
                                          + {unpaidPersonalEvents.length - 3} sự kiện khác...
                                        </div>
                                      )}
                                      <button
                                        onClick={toggleShowAllPersonalEvents}
                                        className={styles.showAllButton}
                                        title={showAllPersonalEvents ? 'Thu gọn danh sách' : 'Hiển thị tất cả sự kiện'}
                                      >
                                        <span className={styles.showAllIcon}>
                                          {showAllPersonalEvents ? '⬆️' : '⬇️'}
                                        </span>
                                        <span className={styles.showAllText}>
                                          {showAllPersonalEvents ? 'Thu gọn' : 'Xem tất cả'}
                                        </span>
                                        <span className={styles.showAllCount}>
                                          ({unpaidPersonalEvents.length})
                                        </span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}

                            {/* Global Bulk Actions - Only show if both games and personal events exist */}
                            {unpaidGames.length > 0 && unpaidPersonalEvents.length > 0 && isAuthenticated && (
                              <div className={styles.globalBulkActions}>
                                <div className={styles.breakdownHeader}>
                                  <span className={styles.breakdownIcon}>🔄</span>
                                  <span className={styles.breakdownTitle}>
                                    Thao tác hàng loạt:
                                  </span>
                                </div>
                                {isAuthenticated && (
                                  <div className={styles.bulkActions}>
                                    <button
                                      onClick={handleMarkAllPaid}
                                      disabled={bulkPaymentMutation.isPending}
                                      className={`${styles.bulkActionBtn} ${styles.markAllPaidBtn}`}
                                      title="Đánh dấu tất cả (trận cầu lông và sự kiện) đã thanh toán"
                                    >
                                      <span className={styles.bulkActionIcon}>✅</span>
                                      <span className={styles.bulkActionText}>
                                        {bulkPaymentMutation.isPending ? 'Đang xử lý...' : 'Đánh dấu tất cả đã thanh toán'}
                                      </span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* QR Code Section */}
          <div className={styles.qrSection}>
            <div className={styles.qrContainer}>
              <div className={styles.qrWrapper}>
                {(!selectedMember ||
                  ((memberOutstandingAmount || 0) + (memberPersonalEventsAmount || 0) === 0) ||
                  isCalculatingAmount) ? (
                  <div className={styles.qrPlaceholder}>
                    {isCalculatingAmount ? (
                      <div className={styles.qrCalculatingState}>
                        <div className={styles.loadingSpinner}></div>
                        <p>
                          {isChangingMember
                            ? "Đang chuẩn bị thông tin thanh toán..."
                            : "Đang tạo mã QR..."
                          }
                        </p>
                      </div>
                    ) : !selectedMember ? (
                      <div className={styles.noMemberSelected}>
                        <span className={styles.selectIcon}>👆</span>
                        <p>Vui lòng chọn thành viên để tạo mã QR thanh toán</p>
                      </div>
                    ) : ((memberOutstandingAmount || 0) + (memberPersonalEventsAmount || 0) === 0) ? (
                      <div className={styles.noMemberSelected}>
                        <span className={styles.selectIcon}>✅</span>
                        <p>Thành viên này không có khoản nào cần thanh toán</p>
                      </div>
                    ) : (
                      <div className={styles.noMemberSelected}>
                        <span className={styles.selectIcon}>👆</span>
                        <p>Vui lòng kiểm tra lại thông tin thanh toán</p>
                      </div>
                    )}
                  </div>
                ) : qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt='QR Code thanh toán'
                    className={styles.qrImage}
                    onError={e => {
                      console.error("QR Code failed to load")
                      e.currentTarget.style.display = "none"
                    }}
                  />
                ) : (
                  <div className={styles.qrPlaceholder}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Đang tạo mã QR...</p>
                  </div>
                )}
                <div className={styles.qrOverlay}>
                  <div className={styles.qrCorners}>
                    <div className={styles.corner}></div>
                    <div className={styles.corner}></div>
                    <div className={styles.corner}></div>
                    <div className={styles.corner}></div>
                  </div>
                </div>
              </div>

              {/* Banking App Button Moved Outside qrWrapper */}
              {selectedMember &&
                ((memberOutstandingAmount || 0) + (memberPersonalEventsAmount || 0) > 0) &&
                !isCalculatingAmount && (
                  <div className={styles.bankingAppSection}>
                    <div className={styles.orDivider}>
                      <span className={styles.orText}>hoặc</span>
                    </div>
                    <button
                      onClick={openBankingApp}
                      className={styles.bankingAppBtn}
                      title='Mở ứng dụng ngân hàng để thanh toán'
                    >
                      <span className={styles.bankAppIcon}>🏦</span>
                      <div className={styles.bankAppContent}>
                        <span className={styles.bankAppTitle}>
                          Mở App Ngân Hàng
                        </span>
                        <span className={styles.bankAppSubtitle}>
                          Thanh toán nhanh chóng
                        </span>
                      </div>
                      <span className={styles.bankAppArrow}>→</span>
                    </button>
                    <div className={styles.bankAppHint}>
                      <span className={styles.hintIcon}>💡</span>
                      <span className={styles.hintText}>
                        Nhấn để mở app ngân hàng với thông tin đã điền sẵn
                      </span>
                    </div>
                  </div>
                )}

              <div className={styles.qrInstructions}>
                <h3>📱 Cách thanh toán:</h3>
                <ol className={styles.instructionsList}>
                  <li>Chọn thành viên cần thanh toán ở phần trên</li>
                  <li>Mở app ngân hàng hoặc ví điện tử</li>
                  <li>Quét mã QR được tạo</li>
                  <li>Kiểm tra thông tin và số tiền</li>
                  <li>Xác nhận hoàn tất thanh toán</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className={styles.paymentInfo}>
            <h3 className={styles.infoTitle}>
              <span className={styles.infoIcon}>ℹ️</span>
              Thông tin thanh toán
            </h3>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>🏦 Ngân hàng:</div>
                <div className={styles.infoValueContainer}>
                  <span className={styles.infoValue}>
                    {paymentInfo.bankName}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(paymentInfo.bankName, "bank")
                    }
                    className={styles.copyBtn}
                    title='Sao chép tên ngân hàng'
                  >
                    {copySuccess === "bank" ? "✅" : "📋"}
                  </button>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>💳 Số tài khoản:</div>
                <div className={styles.infoValueContainer}>
                  <span className={styles.infoValue}>
                    {paymentInfo.accountNumber}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(paymentInfo.accountNumber, "account")
                    }
                    className={styles.copyBtn}
                    title='Sao chép số tài khoản'
                  >
                    {copySuccess === "account" ? "✅" : "📋"}
                  </button>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>👤 Chủ tài khoản:</div>
                <div className={styles.infoValueContainer}>
                  <span className={styles.infoValue}>
                    {paymentInfo.accountHolder}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(paymentInfo.accountHolder, "holder")
                    }
                    className={styles.copyBtn}
                    title='Sao chép tên chủ tài khoản'
                  >
                    {copySuccess === "holder" ? "✅" : "📋"}
                  </button>
                </div>
              </div>

              {paymentInfo.amount && paymentInfo.amount > 0 && (
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>💰 Số tiền:</div>
                  <div className={styles.infoValueContainer}>
                    <span className={styles.infoValue}>
                      {formatCurrency(paymentInfo.amount)}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          paymentInfo.amount?.toString() || "0",
                          "amount"
                        )
                      }
                      className={styles.copyBtn}
                      title='Sao chép số tiền'
                    >
                      {copySuccess === "amount" ? "✅" : "📋"}
                    </button>
                  </div>
                </div>
              )}

              {paymentInfo.content && (
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>📝 Nội dung:</div>
                  <div className={styles.infoValueContainer}>
                    <span className={styles.infoValue}>
                      {paymentInfo.content}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(paymentInfo.content || "", "content")
                      }
                      className={styles.copyBtn}
                      title='Sao chép nội dung chuyển khoản'
                    >
                      {copySuccess === "content" ? "✅" : "📋"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Important Notes */}
          <div className={styles.notesSection}>
            <h3 className={styles.notesTitle}>
              <span className={styles.notesIcon}>⚠️</span>
              Lưu ý quan trọng
            </h3>
            <div className={styles.notesList}>
              <div className={styles.noteItem}>
                <span className={styles.noteIcon}>✅</span>
                <span>
                  Vui lòng kiểm tra kỹ thông tin trước khi chuyển khoản
                </span>
              </div>
              <div className={styles.noteItem}>
                <span className={styles.noteIcon}>📝</span>
                <span>Nhập đúng nội dung chuyển khoản để dễ dàng đối soát</span>
              </div>
              <div className={styles.noteItem}>
                <span className={styles.noteIcon}>💰</span>
                <span>Sau khi chuyển khoản, vui lòng thông báo với admin</span>
              </div>
              <div className={styles.noteItem}>
                <span className={styles.noteIcon}>🔒</span>
                <span>Giao dịch được bảo mật và an toàn</span>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className={styles.contactSection}>
            <h3 className={styles.contactTitle}>
              <span className={styles.contactIcon}>📞</span>
              Cần hỗ trợ?
            </h3>
            <p className={styles.contactText}>
              Liên hệ admin nếu bạn gặp khó khăn trong việc thanh toán
            </p>
            <div className={styles.contactButtons}>
              <a href='tel:+84123456789' className={styles.contactBtn}>
                <span>📱</span>
                Gọi điện
              </a>
              <a href='sms:+84123456789' className={styles.contactBtn}>
                <span>💬</span>
                Nhắn tin
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>🏸 Badminton Club Payment System</p>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={handleConfirmBulkPayment}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        cancelText="Hủy bỏ"
        type="warning"
        isLoading={bulkPaymentMutation.isPending}
      />
    </div>
  )
}

export default PaymentPageContent

