"use client"
import React, { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import styles from "./page.module.css"
import { useToast } from "../../context/ToastContext"
import { useMembers, useMemberOutstanding, usePersonalEvents } from "../../hooks/useQueries"
import MemberAutocomplete from "../../components/MemberAutocomplete"

interface PaymentInfo {
  bankName: string
  accountNumber: string
  accountHolder: string
  amount?: number
  content?: string
}

interface Member {
  id: string
  name: string
  phone?: string
  avatar?: string
  createdAt: string
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
interface PersonalEventParticipant {
  id: string
  personalEventId: string
  memberId: string
  customAmount: number
  hasPaid: boolean
  paidAt?: string
  member: Member
}

interface PersonalEvent {
  id: string
  title: string
  description?: string
  date: string
  location?: string
  totalCost: number
  createdAt: string
  updatedAt: string
  participants: PersonalEventParticipant[]
}

// Payment selection types
type PaymentType = 'games' | 'personal-events'
type PaymentSource = 'member' | 'specific' | 'personal-event'

const PaymentPageContent = () => {
  const searchParams = useSearchParams()
  const { showWarning, showError } = useToast()
  
  // React Query hooks - these will cache the data
  const { 
    data: members = [], 
    isLoading: membersLoading, 
    error: membersError 
  } = useMembers()

  const { 
    data: personalEventsData,
    isLoading: personalEventsLoading,
    error: personalEventsError
  } = usePersonalEvents()
  
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
  
  // Payment type selection state
  const [paymentType, setPaymentType] = useState<PaymentType>('games')
  const [selectedPersonalEvent, setSelectedPersonalEvent] = useState<PersonalEvent | null>(null)
  const [selectedParticipant, setSelectedParticipant] = useState<PersonalEventParticipant | null>(null)
  const [paymentSource, setPaymentSource] = useState<PaymentSource>('member')
  
  // Use the custom hook for outstanding calculation - this will cache the calculation
  const { 
    data: outstandingData, 
    isLoading: outstandingLoading,
    error: outstandingError,
    isFetching: outstandingFetching
  } = useMemberOutstanding(selectedMember?.id || null)
  
  const memberOutstandingAmount = outstandingData?.totalOutstanding || 0
  const unpaidGames = outstandingData?.unpaidGames || []

  // Handle members loading error
  const error = membersError ? 'Failed to load members' : null
  const loading = membersLoading

  // Combined loading state for better UX
  const isCalculatingAmount = outstandingLoading || outstandingFetching || isChangingMember
  
  // Toggle function for showing all games
  const toggleShowAllGames = () => {
    setShowAllGames(prev => !prev)
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
  const handleAutocompleteChange = (member: Member | null) => {
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

  // Update payment info when member is selected
  useEffect(() => {
    if (selectedMember && unpaidGames.length > 0 && memberOutstandingAmount > 0) {
      const paymentContent = generatePaymentContent(selectedMember, unpaidGames)
      setPaymentInfo(prev => ({
        ...prev,
        amount: memberOutstandingAmount,
        content: paymentContent,
      }))
    }
  }, [selectedMember, memberOutstandingAmount, unpaidGames])

  // Get amount and content from URL params (fallback if no member selected)
  useEffect(() => {
    const amount = searchParams.get("amount")
    const content = searchParams.get("content") || searchParams.get("message")
    const gameId = searchParams.get("gameId")
    const memberName = searchParams.get("memberName")
    const personalEventId = searchParams.get("personalEventId")
    const participantId = searchParams.get("participantId")
    const payAll = searchParams.get("payAll")

    // Handle personal event payment URL params
    if (personalEventId) {
      setPaymentSource('personal-event')
      setPaymentType('personal-events')
      
      // Find the personal event and participant
      const personalEvents = personalEventsData?.data || []
      const personalEvent = personalEvents.find(e => e.id === personalEventId)
      
      if (personalEvent) {
        setSelectedPersonalEvent(personalEvent)
        
        if (payAll === 'true') {
          // Pay All mode - calculate total for all unpaid participants
          const unpaidParticipants = personalEvent.participants.filter(p => !p.hasPaid)
          if (unpaidParticipants.length > 0) {
            const totalAmount = unpaidParticipants.reduce((sum, p) => sum + p.customAmount, 0)
            const payAllContent = generatePayAllPersonalEventContent(personalEvent, unpaidParticipants)
            
            setPaymentInfo(prev => ({
              ...prev,
              amount: totalAmount,
              content: payAllContent,
            }))
            return // Exit early for pay all
          }
        } else if (participantId) {
          // Individual participant payment
          const participant = personalEvent.participants.find(p => p.memberId === participantId)
          
          if (participant) {
            setSelectedParticipant(participant)
            setSelectedMember(participant.member)
            
            const personalEventContent = generatePersonalEventPaymentContent(personalEvent, participant.member)
            setPaymentInfo(prev => ({
              ...prev,
              amount: participant.customAmount,
              content: personalEventContent,
            }))
            return // Exit early for personal event payments
          }
        }
      }
    }

    if (selectedMember) return // Don't override if member is selected for games

    if (amount) {
      setPaymentInfo(prev => ({ ...prev, amount: parseInt(amount) }))
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
      setPaymentInfo(prev => ({ ...prev, content: paymentContent }))
    }
  }, [searchParams, selectedMember, personalEventsData])

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
      const qrData = `https://qr.sepay.vn/img?acc=${
        vietQRData.accountNumber
      }&bank=${vietQRData.bankCode}&amount=${
        vietQRData.amount
      }&des=${encodeURIComponent(vietQRData.content)}`

      setQrCodeUrl(qrData)
    }

    generateQRCode()
  }, [paymentInfo])

  // Generate banking app URL for direct payment
  const generateBankingAppUrl = (amount?: number, content?: string): string => {
    // Default to games logic if no parameters provided
    const paymentAmount = amount || memberOutstandingAmount
    const paymentContent = content || (selectedMember && unpaidGames.length > 0 
      ? generatePaymentContent(selectedMember, unpaidGames)
      : "Thanh toan")

    if (!selectedMember || paymentAmount === 0) return "#"

    // VietQR format that works with most Vietnamese banking apps
    const vietQRUrl = `https://qr.sepay.vn/img?acc=${
      paymentInfo.accountNumber
    }&bank=970436&amount=${paymentAmount}&des=${encodeURIComponent(paymentContent)}`

    // Try to detect the user's banking app and use deep linking
    // For mobile devices, we can use intent URLs that will open the banking app
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /android|iphone|ipad|ipod|mobile/.test(userAgent)

    if (isMobile) {
      // For mobile, use intent URL that will prompt to open banking app
      return `intent://payment?bank=970436&account=${
        paymentInfo.accountNumber
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

    let amount = 0
    let content = ""

    if (paymentType === 'games') {
      if (memberOutstandingAmount === 0) {
        showWarning("Thông tin thiếu", "Thành viên không có khoản nào cần thanh toán")
        return
      }
      amount = memberOutstandingAmount
      content = generatePaymentContent(selectedMember, unpaidGames)
    } else if (paymentType === 'personal-events') {
      if (!selectedPersonalEvent || !selectedParticipant) {
        showWarning("Thông tin thiếu", "Vui lòng chọn sự kiện và thành viên cần thanh toán")
        return
      }
      amount = selectedParticipant.customAmount
      content = generatePersonalEventPaymentContent(selectedPersonalEvent, selectedMember)
    }

    if (amount === 0) {
      showWarning("Thông tin thiếu", "Vui lòng đảm bảo có số tiền cần thanh toán")
      return
    }

    const bankingUrl = generateBankingAppUrl(amount, content)
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /android|iphone|ipad|ipod|mobile/.test(userAgent)

    try {
      if (isMobile) {
        // For mobile, try to open banking app first, fallback to browser
        window.location.href = bankingUrl

        // Fallback: If banking app is not installed, open browser after delay
        setTimeout(() => {
          const fallbackUrl = `https://qr.sepay.vn/img?acc=${
            paymentInfo.accountNumber
          }&bank=970436&amount=${amount}&des=${encodeURIComponent(content)}`
          window.open(fallbackUrl, "_blank")
        }, 1500)
      } else {
        // For desktop, open QR page in new tab
        const fallbackUrl = `https://qr.sepay.vn/img?acc=${
          paymentInfo.accountNumber
        }&bank=970436&amount=${amount}&des=${encodeURIComponent(content)}`
        window.open(fallbackUrl, "_blank")
      }
    } catch (error) {
      console.error("Error opening banking app:", error)
      // Final fallback - copy payment info to clipboard
      const paymentDetails = `
Ngân hàng: ${paymentInfo.bankName}
Số tài khoản: ${paymentInfo.accountNumber}
Chủ tài khoản: ${paymentInfo.accountHolder}
Số tiền: ${formatCurrency(amount)}
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
   * @param amount - Amount to format
   * @returns Formatted currency string
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
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

  /**
   * Generates optimized payment content for personal event payments
   * @param personalEvent - The personal event
   * @param member - The member making the payment
   * @returns Formatted payment content string optimized for QR codes
   */
  const generatePersonalEventPaymentContent = (personalEvent: PersonalEvent, member: Member): string => {
    if (!personalEvent || !member) return "Thanh toan ca nhan"

    const eventDate = new Date(personalEvent.date)
    const day = eventDate.getDate()
    const month = eventDate.getMonth() + 1
    
    // Format: "MEMBER_NAME - EVENT_TITLE -> DD.MM" (optimized for QR code)
    let content = `${member.name.toUpperCase()} - ${personalEvent.title.toUpperCase()} -> ${day}.${month}`
    
    // Ensure content is not too long for QR code (max ~25 characters)
    if (content.length > 25) {
      // Shorter fallback
      content = `${member.name.toUpperCase()} - PE -> ${day}.${month}`
    }
    
    return content
  }

  /**
   * Generates payment content for pay all personal events
   * @param personalEvent - The personal event
   * @param unpaidParticipants - Array of unpaid participants
   * @returns Formatted payment content string for group payments
   */
  const generatePayAllPersonalEventContent = (
    personalEvent: PersonalEvent, 
    unpaidParticipants: PersonalEventParticipant[]
  ): string => {
    if (!personalEvent || unpaidParticipants.length === 0) return "Thanh toan ca nhan"

    const eventDate = new Date(personalEvent.date)
    const day = eventDate.getDate()
    const month = eventDate.getMonth() + 1
    
    // Format: "EVENT_TITLE - TAT CA -> DD.MM" (optimized for QR code)
    let content = `${personalEvent.title.toUpperCase()} - TAT CA -> ${day}.${month}`
    
    // Ensure content is not too long for QR code (max ~25 characters)
    if (content.length > 25) {
      // Shorter fallback
      content = `PE TAT CA -> ${day}.${month}`
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
              Chọn loại thanh toán và quét mã QR để thực hiện thanh toán
            </p>
          </div>

          {/* Payment Type Selection */}
          <div className={styles.paymentTypeSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>🏷️</span>
              Loại thanh toán
            </h3>
            <div className={styles.paymentTypeSelector}>
              <button
                onClick={() => {
                  setPaymentType('games')
                  setPaymentSource('member')
                  setSelectedPersonalEvent(null)
                  setSelectedParticipant(null)
                }}
                className={`${styles.paymentTypeBtn} ${
                  paymentType === 'games' ? styles.active : ''
                }`}
              >
                <span className={styles.typeIcon}>🏸</span>
                <div className={styles.typeContent}>
                  <span className={styles.typeTitle}>Cầu lông</span>
                  <span className={styles.typeDesc}>Thanh toán phí thi đấu</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setPaymentType('personal-events')
                  setPaymentSource('personal-event')
                  setSelectedMember(null)
                }}
                className={`${styles.paymentTypeBtn} ${
                  paymentType === 'personal-events' ? styles.active : ''
                }`}
              >
                <span className={styles.typeIcon}>🎉</span>
                <div className={styles.typeContent}>
                  <span className={styles.typeTitle}>Sự kiện cá nhân</span>
                  <span className={styles.typeDesc}>Thanh toán sự kiện nhóm</span>
                </div>
              </button>
            </div>
          </div>

          {/* Member Selection - Games */}
          {paymentType === 'games' && (
            <div className={styles.memberSection}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>👤</span>
                Chọn thành viên
                {/* Show cache status for better UX - React Query automatically handles caching */}
                {!membersLoading && members.length > 0 && !isCalculatingAmount && (
                  <span className={styles.cacheIndicator} title="Dữ liệu đã được cache - thao tác nhanh hơn">
                    ⚡
                  </span>
                )}
                {/* Show calculating indicator */}
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
                      ) : outstandingError ? (
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
                              {formatCurrency(memberOutstandingAmount)}
                            </span>
                          </div>
                          
                          {/* Unpaid Games Breakdown */}
                          {unpaidGames.length > 0 && (
                            <div className={styles.unpaidGamesBreakdown}>
                              <div className={styles.breakdownHeader}>
                                <span className={styles.breakdownIcon}>📋</span>
                                <span className={styles.breakdownTitle}>
                                  Chi tiết các trận chưa thanh toán ({unpaidGames.length} trận):
                                </span>
                              </div>
                              <div className={styles.gamesList}>
                                {(showAllGames ? unpaidGames : unpaidGames.slice(0, 5)).map((game, index) => {
                                  const participation = game.participants.find(p => p.id === selectedMember.id)
                                  const gameAmount = participation ? game.costPerMember - participation.prePaid : game.costPerMember
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
                                {unpaidGames.length > 5 && (
                                  <div className={styles.showMoreContainer}>
                                    {!showAllGames && (
                                      <div className={styles.moreGames}>
                                        + {unpaidGames.length - 5} trận khác...
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

          {/* Personal Event Selection */}
          {paymentType === 'personal-events' && (
            <div className={styles.personalEventSection}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>🎉</span>
                Chọn sự kiện cá nhân
                {personalEventsLoading && (
                  <span className={styles.calculatingIndicatorTitle} title="Đang tải...">
                    <div className={styles.miniLoadingSpinner}></div>
                  </span>
                )}
              </h3>

              {personalEventsLoading ? (
                <div className={styles.loadingState}>
                  <div className={styles.loadingSpinner}></div>
                  <p>Đang tải danh sách sự kiện...</p>
                </div>
              ) : personalEventsError ? (
                <div className={styles.errorState}>
                  <span className={styles.errorIcon}>⚠️</span>
                  <p>Không thể tải danh sách sự kiện</p>
                </div>
              ) : (
                <div className={styles.personalEventSelector}>
                  {/* Show event info if coming from URL params */}
                  {selectedPersonalEvent && (
                    <div className={styles.selectedEventInfo}>
                      <div className={styles.eventInfoHeader}>
                        <span className={styles.eventIcon}>🎉</span>
                        <div className={styles.eventDetails}>
                          <h4 className={styles.eventTitle}>{selectedPersonalEvent.title}</h4>
                          <p className={styles.eventDate}>
                            📅 {new Date(selectedPersonalEvent.date).toLocaleDateString('vi-VN')}
                          </p>
                          {selectedPersonalEvent.location && (
                            <p className={styles.eventLocation}>📍 {selectedPersonalEvent.location}</p>
                          )}
                        </div>
                      </div>

                      {/* Show pay all info if applicable */}
                      {searchParams.get("payAll") === 'true' && (
                        <div className={styles.payAllInfo}>
                          <h5 className={styles.payAllTitle}>
                            <span className={styles.payAllIcon}>💳</span>
                            Thanh toán tập thể
                          </h5>
                          <div className={styles.payAllDetails}>
                            {selectedPersonalEvent.participants
                              .filter(p => !p.hasPaid)
                              .map(participant => (
                                <div key={participant.id} className={styles.payAllParticipant}>
                                  <span className={styles.participantName}>{participant.member.name}</span>
                                  <span className={styles.participantAmount}>
                                    {participant.customAmount.toLocaleString("vi-VN")}đ
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Show individual participant info if applicable */}
                      {selectedParticipant && searchParams.get("payAll") !== 'true' && (
                        <div className={styles.selectedParticipantInfo}>
                          <h5 className={styles.participantInfoTitle}>
                            <span className={styles.participantInfoIcon}>👤</span>
                            Thành viên thanh toán
                          </h5>
                          <div className={styles.participantInfoDetails}>
                            <div className={styles.participantInfoName}>{selectedParticipant.member.name}</div>
                            <div className={styles.participantInfoAmount}>
                              {selectedParticipant.customAmount.toLocaleString("vi-VN")}đ
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Manual selection if no URL params */}
                  {!selectedPersonalEvent && (
                    <>
                      <select
                        value={selectedPersonalEvent?.id || ''}
                        onChange={(e) => {
                          const eventId = e.target.value
                          const personalEvents = personalEventsData?.data || []
                          const event = personalEvents.find(e => e.id === eventId) || null
                          setSelectedPersonalEvent(event)
                          setSelectedParticipant(null)
                          setSelectedMember(null)
                        }}
                        className={styles.personalEventSelect}
                        title="Chọn sự kiện cá nhân để thanh toán"
                        aria-label="Chọn sự kiện cá nhân để thanh toán"
                      >
                        <option value="">Chọn sự kiện...</option>
                        {(personalEventsData?.data || []).map((event) => (
                          <option key={event.id} value={event.id}>
                            🎉 {event.title} - {new Date(event.date).toLocaleDateString('vi-VN')}
                          </option>
                        ))}
                      </select>

                      {selectedPersonalEvent && (
                        <div className={styles.participantSelection}>
                          <h4 className={styles.participantTitle}>
                            <span className={styles.participantIcon}>👥</span>
                            Chọn thành viên thanh toán
                          </h4>
                          <div className={styles.participantsList}>
                            {selectedPersonalEvent.participants.map((participant: PersonalEventParticipant) => (
                              <button
                                key={participant.id}
                                onClick={() => {
                                  setSelectedParticipant(participant)
                                  setSelectedMember(participant.member)
                                  const personalEventContent = generatePersonalEventPaymentContent(selectedPersonalEvent, participant.member)
                                  setPaymentInfo(prev => ({
                                    ...prev,
                                    amount: participant.customAmount,
                                    content: personalEventContent,
                                  }))
                                }}
                                className={`${styles.participantBtn} ${
                                  selectedParticipant?.id === participant.id ? styles.active : ''
                                } ${participant.hasPaid ? styles.paid : styles.unpaid}`}
                                title={
                                  participant.hasPaid 
                                    ? `${participant.member.name} đã thanh toán ${formatCurrency(participant.customAmount)}`
                                    : `${participant.member.name} chưa thanh toán ${formatCurrency(participant.customAmount)}`
                                }
                              >
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
                                    <div className={styles.participantAmount}>
                                      {formatCurrency(participant.customAmount)}
                                    </div>
                                    <div className={styles.participantStatus}>
                                      <span className={`${styles.statusBadge} ${participant.hasPaid ? styles.paid : styles.unpaid}`}>
                                        {participant.hasPaid ? '✅ Đã trả' : '⏳ Chưa trả'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* QR Code Section */}
          <div className={styles.qrSection}>
            <div className={styles.qrContainer}>
              <div className={styles.qrWrapper}>
                {(!selectedMember || 
                  (paymentType === 'games' && memberOutstandingAmount === 0) ||
                  (paymentType === 'personal-events' && !selectedParticipant) ||
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
                        <p>
                          {paymentType === 'games' 
                            ? "Vui lòng chọn thành viên để tạo mã QR thanh toán"
                            : "Vui lòng chọn sự kiện và thành viên để tạo mã QR thanh toán"
                          }
                        </p>
                      </div>
                    ) : paymentType === 'games' && memberOutstandingAmount === 0 ? (
                      <div className={styles.noMemberSelected}>
                        <span className={styles.selectIcon}>✅</span>
                        <p>Thành viên này không có khoản nào cần thanh toán</p>
                      </div>
                    ) : paymentType === 'personal-events' && !selectedParticipant ? (
                      <div className={styles.noMemberSelected}>
                        <span className={styles.selectIcon}>👆</span>
                        <p>Vui lòng chọn thành viên từ danh sách để tạo mã QR thanh toán</p>
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
               ((paymentType === 'games' && memberOutstandingAmount > 0) ||
                (paymentType === 'personal-events' && selectedParticipant)) &&
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
                  <li>
                    {paymentType === 'games' 
                      ? 'Chọn thành viên cần thanh toán ở phần trên'
                      : 'Chọn sự kiện và thành viên cần thanh toán ở phần trên'
                    }
                  </li>
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
    </div>
  )
}

export default PaymentPageContent
