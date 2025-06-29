"use client"
import React, { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import styles from "./page.module.css"

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

const PaymentPage = () => {
  const searchParams = useSearchParams()
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    bankName: "Vietcombank",
    accountNumber: "9937822899",
    accountHolder: "NGUYEN HOANG TUAN CUONG",
    content: "Thanh toan cau long",
  })

  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [copySuccess, setCopySuccess] = useState<string>("")
  const [members, setMembers] = useState<Member[]>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [memberOutstandingAmount, setMemberOutstandingAmount] =
    useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")

  // Fetch members from API
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/members")
        if (!response.ok) {
          throw new Error("Failed to fetch members")
        }
        const membersData = await response.json()
        setMembers(membersData)
      } catch (error) {
        console.error("Error fetching members:", error)
        setError("Failed to load members")
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [])

  // Calculate outstanding amount for selected member
  useEffect(() => {
    const calculateOutstandingAmount = async () => {
      if (!selectedMember) {
        setMemberOutstandingAmount(0)
        return
      }

      try {
        // Fetch games to calculate outstanding amount
        const response = await fetch("/api/games")
        if (!response.ok) {
          throw new Error("Failed to fetch games")
        }
        const games: Game[] = await response.json()

        let totalOutstanding = 0
        games.forEach(game => {
          const participation = game.participants.find(
            p => p.id === selectedMember.id
          )
          if (participation && !participation.hasPaid) {
            totalOutstanding += game.costPerMember - participation.prePaid
          }
        })

        setMemberOutstandingAmount(totalOutstanding)
      } catch (error) {
        console.error("Error calculating outstanding amount:", error)
        setMemberOutstandingAmount(0)
      }
    }

    calculateOutstandingAmount()
  }, [selectedMember])

  // Update payment info when member is selected
  useEffect(() => {
    if (selectedMember) {
      setPaymentInfo(prev => ({
        ...prev,
        amount: memberOutstandingAmount,
        content: `${selectedMember.name.toUpperCase()} TRA TIEN CAU LONG`,
      }))
    }
  }, [selectedMember, memberOutstandingAmount])

  // Get amount and content from URL params (fallback if no member selected)
  useEffect(() => {
    if (selectedMember) return // Don't override if member is selected

    const amount = searchParams.get("amount")
    const content = searchParams.get("content") || searchParams.get("message")
    const gameId = searchParams.get("gameId")
    const memberName = searchParams.get("memberName")

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
      const qrData = `https://qr.sepay.vn/img?acc=${
        vietQRData.accountNumber
      }&bank=${vietQRData.bankCode}&amount=${
        vietQRData.amount
      }&des=${encodeURIComponent(vietQRData.content)}`

      setQrCodeUrl(qrData)
    }

    generateQRCode()
  }, [paymentInfo])

  const copyToClipboard = async (text: string, type: string) => {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
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
              <span className={styles.icon}>💳</span>
            </div>
            <h1 className={styles.title}>Thanh Toán QR</h1>
            <p className={styles.subtitle}>
              Chọn thành viên và quét mã QR để thanh toán phí cầu lông
            </p>
          </div>

          {/* Member Selection */}
          <div className={styles.memberSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>👤</span>
              Chọn thành viên
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
                <select
                  value={selectedMember?.id || ""}
                  onChange={e => {
                    const member = members.find(m => m.id === e.target.value)
                    setSelectedMember(member || null)
                  }}
                  className={styles.memberDropdown}
                  title='Chọn thành viên để thanh toán'
                  aria-label='Chọn thành viên để thanh toán'
                >
                  <option value=''>-- Chọn thành viên --</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} {member.phone ? `(${member.phone})` : ""}
                    </option>
                  ))}
                </select>

                {selectedMember && (
                  <div className={styles.memberInfo}>
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
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* QR Code Section */}
          <div className={styles.qrSection}>
            <div className={styles.qrContainer}>
              <div className={styles.qrWrapper}>
                {!selectedMember || memberOutstandingAmount === 0 ? (
                  <div className={styles.qrPlaceholder}>
                    <div className={styles.noMemberSelected}>
                      <span className={styles.selectIcon}>👆</span>
                      <p>
                        {!selectedMember
                          ? "Vui lòng chọn thành viên để tạo mã QR thanh toán"
                          : "Thành viên này không có khoản nào cần thanh toán"}
                      </p>
                    </div>
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
    </div>
  )
}

export default PaymentPage
