"use client"
import React, { useState, useEffect } from "react"
import { apiService } from "../lib/api"
import _ from "lodash"
import { EditableContent, usePermissions } from "./AuthorizedComponent"
import styles from "./GameForm.module.css"

interface Member {
  id: string
  name: string
  phone?: string
  participantId?: string // For existing games
  hasPaid?: boolean // Payment status
  paidAt?: string // Payment timestamp
}

interface GameFormProps {
  members: Member[]
  onGameCreated: () => void
  gameData?: any // For editing existing games
  isEditing?: boolean // Flag for editing mode
}

const GameForm: React.FC<GameFormProps> = ({
  members = [],
  onGameCreated,
  gameData = null,
  isEditing = false,
}) => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [location, setLocation] = useState("")
  const [yardCost, setYardCost] = useState<number>(0)
  const [shuttleCockQuantity, setShuttleCockQuantity] = useState<number>(0)
  const [shuttleCockPrice, setShuttleCockPrice] = useState<number>(15000)
  const [otherFees, setOtherFees] = useState<number>(0)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [memberPrePays, setMemberPrePays] = useState<{
    [key: string]: { amount: number; category: string }
  }>({}) // ✅ New state for pre-pays
  const [totalCost, setTotalCost] = useState<number>(0)
  const [costPerMember, setCostPerMember] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [success, setSuccess] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [memberPaymentStatus, setMemberPaymentStatus] = useState<{
    [key: string]: boolean
  }>({})

  // Get permissions
  const { canEdit, userRole } = usePermissions()

  // Preset values for quick selection
  const presetCosts = [
    { label: "🏟️ 2H Hưng Phú", value: 160000, icon: "🏢" },
    { label: "👑 2H Sân Khác", value: 240000, icon: "✨" },
  ]

  const presetShuttlecocks = [
    { label: "🏃‍♂️ Cầu 88", quantity: 1, price: 24000, icon: "💪" },
    { label: "🏸 Vinawin Loai 2", quantity: 1, price: 18000, icon: "🎯" },
  ]

  const presetLocations = [
    { label: "🏟️ Hưng Phú", value: "Hưng Phú", icon: "🏢" },
    { label: "🌟 Hoà Bình", value: "Hoà Bình", icon: "🏓" },
  ]

  // Initialize form data for editing
  useEffect(() => {
    if (isEditing && gameData) {
      setDate(new Date(gameData.date).toISOString().split("T")[0])
      setLocation(gameData.location || "")
      setYardCost(gameData.yardCost || 0)
      setShuttleCockQuantity(gameData.shuttleCockQuantity || 0)
      setShuttleCockPrice(gameData.shuttleCockPrice || 15000)
      setOtherFees(gameData.otherFees || 0)

      // Set selected members and payment status
      if (gameData.participants) {
        const memberIds = gameData.participants.map((p: any) => p.id)
        setSelectedMembers(memberIds)

        const paymentMap: { [key: string]: boolean } = {}
        const prePayMap: {
          [key: string]: { amount: number; category: string }
        } = {}
        gameData.participants.forEach((participant: any) => {
          paymentMap[participant.id] = participant.hasPaid || false
          prePayMap[participant.id] = {
            amount: participant.prePaid || 0,
            category: participant.prePaidCategory || "",
          }
        })
        setMemberPaymentStatus(paymentMap)
        setMemberPrePays(prePayMap)
      }
    }
  }, [isEditing, gameData])

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => {
      const newSelection = prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]

      // Clear pre-pay for unselected members
      if (!newSelection.includes(memberId)) {
        setMemberPrePays(prevPrePays => {
          const newPrePays = { ...prevPrePays }
          delete newPrePays[memberId]
          return newPrePays
        })
      }

      return newSelection
    })

    if (errors.members) {
      setErrors(prev => _.omit(prev, "members"))
    }
  }

  const selectAllMembers = () => {
    setSelectedMembers(members.map(member => member.id))
    setErrors(prev => _.omit(prev, "members"))
  }

  const clearAllMembers = () => {
    setSelectedMembers([])
    setMemberPrePays({}) // Clear all pre-pays when clearing members
  }

  // ✅ Handle pre-pay input changes
  const handlePrePayChange = (
    memberId: string,
    amount: number,
    category?: string
  ) => {
    setMemberPrePays(prev => ({
      ...prev,
      [memberId]: {
        amount: Math.max(0, amount),
        category:
          category !== undefined ? category : prev[memberId]?.category || "",
      },
    }))
  }

  const handlePaymentToggle = async (memberId: string) => {
    if (!isEditing || !gameData) return

    const currentStatus = memberPaymentStatus[memberId] || false
    const newStatus = !currentStatus

    try {
      await apiService.games.togglePayment(gameData.id, memberId, newStatus)

      setMemberPaymentStatus(prev => ({
        ...prev,
        [memberId]: newStatus,
      }))

      setSuccess(`🎉 Đã cập nhật trạng thái thanh toán!`)
      setTimeout(() => setSuccess(""), 2000)
    } catch (error) {
      console.error("Error updating payment:", error)
      setErrors({
        submit: "Không thể cập nhật trạng thái thanh toán",
      })
    }
  }

  const calculateTotalCost = () => {
    const shuttleCockCost = shuttleCockQuantity * shuttleCockPrice
    const total = yardCost + shuttleCockCost + otherFees
    setTotalCost(total)

    if (selectedMembers.length > 0) {
      setCostPerMember(Math.round(total / selectedMembers.length))
    } else {
      setCostPerMember(0)
    }
  }

  useEffect(() => {
    calculateTotalCost()
  }, [
    yardCost,
    shuttleCockQuantity,
    shuttleCockPrice,
    otherFees,
    selectedMembers,
  ])

  // ✅ Calculate remaining amounts for each member (can be negative if overpaid)
  const getMemberRemainingAmount = (memberId: string) => {
    const prePay = memberPrePays[memberId]?.amount || 0
    return costPerMember - prePay // Allow negative values for overpayment
  }

  // ✅ Calculate total pre-paid amount
  const getTotalPrePaid = () => {
    return selectedMembers.reduce((sum, memberId) => {
      return sum + (memberPrePays[memberId]?.amount || 0)
    }, 0)
  }

  // ✅ Calculate total remaining to collect
  const getTotalRemaining = () => {
    return selectedMembers.reduce((sum, memberId) => {
      return sum + getMemberRemainingAmount(memberId)
    }, 0)
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // Validate date
    const gameDate = new Date(date)
    const today = new Date()
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(today.getFullYear() - 1)

    if (gameDate > today) {
      newErrors.date = "Ngày trận đấu không thể là tương lai"
    }
    if (gameDate < oneYearAgo) {
      newErrors.date = "Ngày trận đấu không thể quá 1 năm trước"
    }

    // Validate location
    if (!location.trim()) {
      newErrors.location = "Địa điểm thi đấu là bắt buộc"
    } else if (location.trim().length < 3) {
      newErrors.location = "Địa điểm phải có ít nhất 3 ký tự"
    }

    // Validate costs
    if (yardCost < 0) {
      newErrors.yardCost = "Chi phí sân không được âm"
    }
    if (yardCost > 1000000) {
      newErrors.yardCost = "Chi phí sân quá cao (tối đa 1,000,000đ)"
    }

    if (shuttleCockQuantity < 0) {
      newErrors.shuttleCockQuantity = "Số lượng cầu không được âm"
    }
    if (shuttleCockQuantity > 20) {
      newErrors.shuttleCockQuantity = "Số lượng cầu quá nhiều (tối đa 20 quả)"
    }

    if (shuttleCockPrice < 0) {
      newErrors.shuttleCockPrice = "Giá cầu không được âm"
    }
    if (shuttleCockPrice > 100000) {
      newErrors.shuttleCockPrice = "Giá cầu quá cao (tối đa 100,000đ/quả)"
    }

    // Validate other fees - now required
    if (otherFees <= 0) {
      newErrors.otherFees = "Chi phí khác là bắt buộc"
    }
    if (otherFees > 500000) {
      newErrors.otherFees = "Chi phí khác quá cao (tối đa 500,000đ)"
    }

    // Validate members
    if (selectedMembers.length === 0) {
      newErrors.members = "Vui lòng chọn ít nhất 1 thành viên"
    }
    if (selectedMembers.length > 20) {
      newErrors.members = "Số lượng thành viên quá nhiều (tối đa 20 người)"
    }

    // Validate total cost
    if (totalCost <= 0) {
      newErrors.totalCost = "Tổng chi phí phải lớn hơn 0"
    }

    setErrors(newErrors)
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors }
  }

  // Function to scroll to first error and show validation errors
  const scrollToFirstError = () => {
    // First validate to get latest errors
    const validation = validateForm()

    // Wait a bit for errors to be set, then scroll
    setTimeout(() => {
      let firstErrorElement: HTMLElement | null = null

      // Check for totalCost error specifically and scroll to cost summary
      if (validation.errors.totalCost) {
        const costSummaryElement = document.querySelector(
          `.${styles.costSummaryCard}`
        ) as HTMLElement
        if (costSummaryElement) {
          firstErrorElement = costSummaryElement
        }
      }

      // If no totalCost error or cost summary not found, look for other error elements
      if (!firstErrorElement) {
        firstErrorElement = document.querySelector(
          '[class*="fieldError"], [class*="sectionError"]'
        ) as HTMLElement
      }

      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })

        // Add a slight shake animation to draw attention
        firstErrorElement.style.animation = "shake 0.6s ease-in-out"
        setTimeout(() => {
          if (firstErrorElement && firstErrorElement.style) {
            firstErrorElement.style.animation = ""
          }
        }, 600)
      }
    }, 100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess("")

    const validation = validateForm()
    if (!validation.isValid) {
      scrollToFirstError()
      return
    }

    setIsSubmitting(true)

    try {
      if (isEditing && gameData) {
        // Transform memberPrePays to the format expected by API
        const apiPrePays: { [key: string]: { amount: number; category: string } } = {}
        Object.entries(memberPrePays).forEach(([memberId, prePayData]) => {
          apiPrePays[memberId] = {
            amount: prePayData.amount,
            category: prePayData.category
          }
        })

        // Update existing game
        await apiService.games.update(gameData.id, {
          date,
          location: location.trim(),
          yardCost,
          shuttleCockQuantity,
          shuttleCockPrice,
          otherFees,
          totalCost,
          memberIds: selectedMembers,
          costPerMember,
          memberPrePays: apiPrePays,
        })
        setSuccess("🎉 Cập nhật trận đấu thành công!")
      } else {
        // Transform memberPrePays to the format expected by API
        const apiPrePays: { [key: string]: { amount: number; category: string } } = {}
        Object.entries(memberPrePays).forEach(([memberId, prePayData]) => {
          apiPrePays[memberId] = {
            amount: prePayData.amount,
            category: prePayData.category
          }
        })

        // Create new game
        await apiService.games.create({
          date,
          location: location.trim(),
          yardCost,
          shuttleCockQuantity,
          shuttleCockPrice,
          otherFees,
          totalCost,
          memberIds: selectedMembers,
          costPerMember,
          memberPrePays: apiPrePays, // ✅ Include pre-pays in correct format
        })

        // Reset form for new game
        setDate(new Date().toISOString().split("T")[0])
        setLocation("")
        setYardCost(0)
        setShuttleCockQuantity(0)
        setShuttleCockPrice(15000)
        setOtherFees(0)
        setSelectedMembers([])
        setMemberPrePays({}) // ✅ Reset pre-pays
        setSearchTerm("")
        setErrors({})
        setMemberPaymentStatus({})

        setSuccess("🎉 Ghi nhận trận đấu thành công!")
      }

      onGameCreated()
      window.scrollTo({ top: 0, behavior: "smooth" })
      setTimeout(() => setSuccess(""), 5000)
    } catch (error) {
      console.error("Error creating/updating game:", error)
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Không thể ghi nhận trận đấu. Vui lòng thử lại!",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate payment statistics
  const paidCount = Object.values(memberPaymentStatus).filter(
    paid => paid
  ).length
  const unpaidCount = selectedMembers.length - paidCount
  const totalCollected = paidCount * costPerMember

  return (
    <div className={styles.gameFormContainer}>
      {/* Success Message */}
      {success && (
        <div
          className={`${styles.alert} ${styles.successAlert} ${styles.bounceIn}`}
        >
          <div className={styles.alertIcon}>🎉</div>
          <div className={styles.alertContent}>
            <div className={styles.alertTitle}>Tuyệt vời!</div>
            <div className={styles.alertMessage}>{success}</div>
          </div>
          <div className={styles.successConfetti}>
            <span>🎊</span>
            <span>✨</span>
            <span>🎉</span>
          </div>
        </div>
      )}

      {/* Global Error */}
      {errors.submit && (
        <div className={`${styles.alert} ${styles.errorAlert} ${styles.shake}`}>
          <div className={styles.alertIcon}>😅</div>
          <div className={styles.alertContent}>
            <div className={styles.alertTitle}>Oops! Có lỗi xảy ra</div>
            <div className={styles.alertMessage}>{errors.submit}</div>
          </div>
          <button
            onClick={() => setErrors(prev => _.omit(prev, "submit"))}
            className={styles.alertClose}
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.gameFormFriendly}>
        {/* Section 1: Basic Info */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>📅</div>
            <div className={styles.sectionTitle}>
              <h3>Thông Tin Cơ Bản</h3>
              <p>Cho chúng mình biết khi nào và ở đâu bạn chơi nhé!</p>
            </div>
          </div>

          <div className={styles.sectionContent}>
            {/* Date field - full width */}
            <div className={styles.formRow}>
              <div className={styles.fieldGroup}>
                <label
                  htmlFor='date'
                  className={`${styles.fieldLabel} ${styles.friendly}`}
                >
                  <span className={styles.labelIcon}>📅</span>
                  <span className={styles.labelText}>Ngày chơi</span>
                  <span className={styles.requiredStar}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type='date'
                    id='date'
                    value={date}
                    onChange={e => {
                      setDate(e.target.value)
                      if (errors.date) setErrors(prev => _.omit(prev, "date"))
                    }}
                    className={`${styles.formInput} ${styles.friendly} ${
                      errors.date ? "error" : ""
                    }`}
                    max={new Date().toISOString().split("T")[0]}
                  />
                  <div className={styles.inputGlow}></div>
                </div>
                {errors.date && (
                  <div className={`${styles.fieldError} ${styles.friendly}`}>
                    <span>😅 {errors.date}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location field - full width */}
            <div className={styles.formRow}>
              <div className={styles.fieldGroup}>
                <label
                  htmlFor='location'
                  className={`${styles.fieldLabel} ${styles.friendly}`}
                >
                  <span className={styles.labelIcon}>📍</span>
                  <span className={styles.labelText}>Địa điểm chơi</span>
                  <span className={styles.requiredStar}>*</span>
                </label>

                {/* Preset location buttons */}
                <div className={styles.presetGrid}>
                  {presetLocations.map((preset, index) => (
                    <button
                      key={index}
                      type='button'
                      onClick={() => {
                        setLocation(preset.value)
                        if (errors.location)
                          setErrors(prev => _.omit(prev, "location"))
                      }}
                      className={`${styles.presetCard} ${
                        location === preset.value ? styles.selected : ""
                      }`}
                    >
                      <div className={styles.presetIcon}>{preset.icon}</div>
                      <div className={styles.presetLabel}>{preset.label}</div>
                    </button>
                  ))}
                </div>

                <div className={styles.inputWrapper}>
                  <input
                    type='text'
                    id='location'
                    value={location}
                    onChange={e => {
                      setLocation(e.target.value)
                      if (errors.location)
                        setErrors(prev => _.omit(prev, "location"))
                    }}
                    className={`${styles.formInput} ${styles.friendly} ${
                      errors.location ? "error" : ""
                    } ${location.trim() ? "filled" : ""}`}
                    placeholder='Hoặc nhập địa điểm khác...'
                    maxLength={100}
                  />
                  <div className={styles.inputGlow}></div>
                  {location.trim() && (
                    <div className={styles.inputCheck}>✓</div>
                  )}
                </div>
                {errors.location && (
                  <div className={`${styles.fieldError} ${styles.friendly}`}>
                    <span>😅 {errors.location}</span>
                  </div>
                )}
                <div className={styles.fieldTip}>
                  <span>💡 Ghi rõ tên sân để lần sau dễ nhớ nha!</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Costs */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>💰</div>
            <div className={styles.sectionTitle}>
              <h3>Chi Phí</h3>
              <p>Hãy nhập chi phí để chia đều cho mọi người!</p>
            </div>
          </div>

          <div className={styles.sectionContent}>
            {/* Court Cost */}
            <div className={styles.subsection}>
              <h4 className={styles.subsectionTitle}>
                <span>🏟️</span>
                Chi phí thuê sân
              </h4>

              {/* Preset buttons */}
              <div className={styles.presetGrid}>
                {presetCosts.map((preset, index) => (
                  <button
                    key={index}
                    type='button'
                    onClick={() => {
                      setYardCost(preset.value)
                      if (errors.yardCost)
                        setErrors(prev => _.omit(prev, "yardCost"))
                    }}
                    className={`${styles.presetCard} ${
                      yardCost === preset.value ? styles.selected : ""
                    }`}
                  >
                    <div className={styles.presetIcon}>{preset.icon}</div>
                    <div className={styles.presetLabel}>{preset.label}</div>
                    <div className={styles.presetValue}>
                      {preset.value.toLocaleString("vi-VN")}đ
                    </div>
                  </button>
                ))}
              </div>

              <div className={styles.fieldGroup}>
                <label
                  htmlFor='yardCost'
                  className={`${styles.fieldLabel} ${styles.friendly}`}
                >
                  <span className={styles.labelText}>
                    Hoặc nhập số tiền khác
                  </span>
                </label>
                <div className={`${styles.inputWrapper} ${styles.money}`}>
                  <div className={styles.inputPrefix}>×1000</div>
                  <input
                    type='text'
                    id='yardCost'
                    value={yardCost === 0 ? "" : (yardCost / 1000).toString()}
                    onFocus={e => e.target.select()}
                    onChange={e => {
                      const value = e.target.value.replace(/[^0-9]/g, "") // Only allow numbers
                      setYardCost(value === "" ? 0 : Number(value) * 1000)
                      if (errors.yardCost)
                        setErrors(prev => _.omit(prev, "yardCost"))
                    }}
                    className={`${styles.formInput} ${styles.friendly} ${
                      styles.money
                    } ${errors.yardCost ? "error" : ""} ${
                      yardCost > 0 ? "filled" : ""
                    }`}
                    placeholder='160'
                  />
                  <div className={`${styles.inputSuffix} ${styles.money}`}>
                    đ
                  </div>
                  <div className={styles.inputGlow}></div>
                </div>
                <div className={styles.fieldTip}>
                  <span>💡 Nhập 160 = 160,000đ (tự động nhân 1000)</span>
                </div>
                {errors.yardCost && (
                  <div className={`${styles.fieldError} ${styles.friendly}`}>
                    <span>😅 {errors.yardCost}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shuttlecock Section */}
            <div className={styles.subsection}>
              <h4 className={styles.subsectionTitle}>
                <span>🏸</span>
                Chi phí cầu lông
              </h4>

              {/* Preset shuttlecock combinations */}
              <div className={styles.presetGrid}>
                {presetShuttlecocks.map((preset, index) => (
                  <button
                    key={index}
                    type='button'
                    onClick={() => {
                      setShuttleCockQuantity(preset.quantity)
                      setShuttleCockPrice(preset.price)
                      if (errors.shuttleCockQuantity)
                        setErrors(prev => _.omit(prev, "shuttleCockQuantity"))
                      if (errors.shuttleCockPrice)
                        setErrors(prev => _.omit(prev, "shuttleCockPrice"))
                    }}
                    className={`${styles.presetCard} ${
                      shuttleCockQuantity === preset.quantity &&
                      shuttleCockPrice === preset.price
                        ? styles.selected
                        : ""
                    }`}
                  >
                    <div className={styles.presetIcon}>{preset.icon}</div>
                    <div className={styles.presetLabel}>{preset.label}</div>
                    <div className={styles.presetDetail}>
                      {preset.quantity} quả ×{" "}
                      {preset.price.toLocaleString("vi-VN")}đ
                    </div>
                    <div className={styles.presetTotal}>
                      ={" "}
                      {(preset.quantity * preset.price).toLocaleString("vi-VN")}
                      đ
                    </div>
                  </button>
                ))}
              </div>

              <div className={styles.formRow}>
                <div className={styles.fieldGroup}>
                  <label
                    htmlFor='shuttleCockQuantity'
                    className={`${styles.fieldLabel} ${styles.friendly}`}
                  >
                    <span className={styles.labelIcon}>🔢</span>
                    <span className={styles.labelText}>Số lượng cầu</span>
                  </label>

                  {/* Quick quantity selection buttons */}
                  <div className={styles.quantityPresets}>
                    {[1, 2, 3, 4, 5, 6, 7].map(quantity => (
                      <button
                        key={quantity}
                        type='button'
                        onClick={() => {
                          setShuttleCockQuantity(quantity)
                          if (errors.shuttleCockQuantity)
                            setErrors(prev =>
                              _.omit(prev, "shuttleCockQuantity")
                            )
                        }}
                        className={`${styles.quantityBtn} ${
                          shuttleCockQuantity === quantity
                            ? styles.selected
                            : ""
                        }`}
                      >
                        {quantity}
                      </button>
                    ))}
                  </div>

                  <div className={styles.inputWrapper}>
                    <input
                      type='text'
                      id='shuttleCockQuantity'
                      value={
                        shuttleCockQuantity === 0
                          ? ""
                          : shuttleCockQuantity.toString()
                      }
                      onFocus={e => e.target.select()}
                      onChange={e => {
                        const value = e.target.value.replace(/[^0-9]/g, "") // Only allow numbers
                        setShuttleCockQuantity(value === "" ? 0 : Number(value))
                        if (errors.shuttleCockQuantity)
                          setErrors(prev => _.omit(prev, "shuttleCockQuantity"))
                      }}
                      className={`${styles.formInput} ${styles.friendly} ${
                        errors.shuttleCockQuantity ? "error" : ""
                      }`}
                      placeholder='0'
                    />
                    <div className={styles.inputSuffix}>quả</div>
                    <div className={styles.inputGlow}></div>
                  </div>
                  {errors.shuttleCockQuantity && (
                    <div className={`${styles.fieldError} ${styles.friendly}`}>
                      <span>😅 {errors.shuttleCockQuantity}</span>
                    </div>
                  )}
                </div>

                <div className={styles.fieldGroup}>
                  <label
                    htmlFor='shuttleCockPrice'
                    className={`${styles.fieldLabel} ${styles.friendly}`}
                  >
                    <span className={styles.labelIcon}>💰</span>
                    <span className={styles.labelText}>Giá mỗi quả</span>
                  </label>
                  <div className={`${styles.inputWrapper} ${styles.money}`}>
                    <div className={styles.inputPrefix}>×1000</div>
                    <input
                      type='text'
                      id='shuttleCockPrice'
                      value={
                        shuttleCockPrice === 0
                          ? ""
                          : (shuttleCockPrice / 1000).toString()
                      }
                      onFocus={e => e.target.select()}
                      onChange={e => {
                        const value = e.target.value.replace(/[^0-9]/g, "") // Only allow numbers
                        setShuttleCockPrice(
                          value === "" ? 0 : Number(value) * 1000
                        )
                        if (errors.shuttleCockPrice)
                          setErrors(prev => _.omit(prev, "shuttleCockPrice"))
                      }}
                      className={`${styles.formInput} ${styles.friendly} ${
                        styles.money
                      } ${errors.shuttleCockPrice ? "error" : ""}`}
                      placeholder='15'
                    />
                    <div className={`${styles.inputSuffix} ${styles.money}`}>
                      đ
                    </div>
                    <div className={styles.inputGlow}></div>
                  </div>
                  <div className={styles.fieldTip}>
                    <span>💡 Nhập 15 = 15,000đ (tự động nhân 1000)</span>
                  </div>
                  {errors.shuttleCockPrice && (
                    <div className={`${styles.fieldError} ${styles.friendly}`}>
                      <span>😅 {errors.shuttleCockPrice}</span>
                    </div>
                  )}
                </div>
              </div>

              {shuttleCockQuantity > 0 && shuttleCockPrice > 0 && (
                <div className={styles.calculationResult}>
                  <span className={styles.calcLabel}>Tổng tiền cầu:</span>
                  <span className={styles.calcValue}>
                    {(shuttleCockQuantity * shuttleCockPrice).toLocaleString(
                      "vi-VN"
                    )}
                    đ
                  </span>
                </div>
              )}
            </div>

            {/* Other Fees */}
            <div className={styles.fieldGroup}>
              <label
                htmlFor='otherFees'
                className={`${styles.fieldLabel} ${styles.friendly}`}
              >
                <span className={styles.labelIcon}>📋</span>
                <span className={styles.labelText}>Chi phí khác</span>
                <span className={styles.requiredStar}>*</span>
              </label>
              <div className={`${styles.inputWrapper} ${styles.money}`}>
                <div className={styles.inputPrefix}>×1000</div>
                <input
                  type='text'
                  id='otherFees'
                  value={otherFees === 0 ? "" : (otherFees / 1000).toString()}
                  onFocus={e => e.target.select()}
                  onChange={e => {
                    const value = e.target.value.replace(/[^0-9]/g, "") // Only allow numbers
                    setOtherFees(value === "" ? 0 : Number(value) * 1000)
                    if (errors.otherFees)
                      setErrors(prev => _.omit(prev, "otherFees"))
                  }}
                  className={`${styles.formInput} ${styles.friendly} ${
                    styles.money
                  } ${errors.otherFees ? "error" : ""} ${
                    otherFees > 0 ? "filled" : ""
                  }`}
                  placeholder='Nhập chi phí...'
                />
                <div className={`${styles.inputSuffix} ${styles.money}`}>đ</div>
                <div className={styles.inputGlow}></div>
              </div>
              {errors.otherFees && (
                <div className={`${styles.fieldError} ${styles.friendly}`}>
                  <span>😅 {errors.otherFees}</span>
                </div>
              )}
              <div className={styles.fieldTip}>
                <span>
                  💡 VD: Đậu xe, nước uống, vé vào cổng... (Nhập 50 = 50,000đ) -
                  Bắt buộc nhập
                </span>
              </div>
            </div>

            {/* Cost Summary */}
            {totalCost > 0 && (
              <div
                className={`${styles.costSummaryCard} ${
                  errors.totalCost ? styles.errorHighlight : ""
                }`}
              >
                <h4 className={styles.summaryTitle}>
                  <span>💳</span>
                  Tổng quan chi phí
                </h4>
                <div className={styles.costBreakdown}>
                  <div className={styles.costItem}>
                    <span className={styles.costIcon}>🏟️</span>
                    <span className={styles.costLabel}>Thuê sân:</span>
                    <span className={styles.costValue}>
                      {yardCost.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  {shuttleCockQuantity > 0 && (
                    <div className={styles.costItem}>
                      <span className={styles.costIcon}>🏸</span>
                      <span className={styles.costLabel}>Cầu lông:</span>
                      <span className={styles.costValue}>
                        {(
                          shuttleCockQuantity * shuttleCockPrice
                        ).toLocaleString("vi-VN")}
                        đ
                      </span>
                    </div>
                  )}
                  {otherFees > 0 && (
                    <div className={styles.costItem}>
                      <span className={styles.costIcon}>📋</span>
                      <span className={styles.costLabel}>Chi phí khác:</span>
                      <span className={styles.costValue}>
                        {otherFees.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  )}
                  <div className={styles.costTotal}>
                    <span className={styles.totalIcon}>🧮</span>
                    <span className={styles.totalLabel}>Tổng cộng:</span>
                    <span className={styles.totalValue}>
                      {totalCost.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  {selectedMembers.length > 0 && (
                    <div className={styles.costPerPerson}>
                      <span className={styles.personIcon}>👤</span>
                      <span className={styles.personLabel}>Mỗi người:</span>
                      <span className={styles.personValue}>
                        {costPerMember.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  )}
                  {/* ✅ Add pre-pay summary */}
                  {selectedMembers.length > 0 && getTotalPrePaid() > 0 && (
                    <div className={styles.prepaySummary}>
                      <div className={`${styles.costItem} ${styles.prepay}`}>
                        <span className={styles.costIcon}>💸</span>
                        <span className={styles.costLabel}>Đã trả trước:</span>
                        <span className={styles.costValue}>
                          -{getTotalPrePaid().toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                      <div className={`${styles.costItem} ${styles.remaining}`}>
                        <span className={styles.costIcon}>💰</span>
                        <span className={styles.costLabel}>Còn cần thu:</span>
                        <span className={styles.costValue}>
                          {getTotalRemaining().toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Members */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>👥</div>
            <div className={styles.sectionTitle}>
              <h3>Thành Viên Tham Gia</h3>
              <p>
                {isEditing
                  ? "Theo dõi và cập nhật trạng thái thanh toán!"
                  : "Chọn những người bạn chơi cùng và nhập số tiền đã trả trước (nếu có)!"}
              </p>
            </div>
          </div>

          <div className={styles.sectionContent}>
            {members.length === 0 ? (
              <div className={styles.emptyMembersCard}>
                <div className={styles.emptyIcon}>😕</div>
                <h4>Chưa có thành viên nào</h4>
                <p>Bạn cần thêm thành viên trước khi ghi nhận trận đấu</p>
                <button
                  type='button'
                  onClick={() => (window.location.href = "/members")}
                  className={styles.btnAddMembers}
                >
                  <span>➕</span>
                  Thêm thành viên ngay
                </button>
              </div>
            ) : (
              <div className={styles.membersSectionContent}>
                {/* Search and Quick Actions */}
                <div className={styles.membersControls}>
                  <div className={styles.searchWrapperFriendly}>
                    <div className={styles.searchIcon}>🔍</div>
                    <input
                      type='text'
                      placeholder='Tìm tên thành viên...'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className={styles.searchInputFriendly}
                    />
                    {searchTerm && (
                      <button
                        type='button'
                        onClick={() => setSearchTerm("")}
                        className={styles.searchClearFriendly}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className={styles.memberQuickActions}>
                    <button
                      type='button'
                      onClick={selectAllMembers}
                      className={`${styles.quickActionBtn} ${styles.selectAll}`}
                      disabled={selectedMembers.length === members.length}
                    >
                      <span>✅</span>
                      Chọn tất cả
                    </button>
                    <button
                      type='button'
                      onClick={clearAllMembers}
                      className={`${styles.quickActionBtn} ${styles.clearAll}`}
                      disabled={selectedMembers.length === 0}
                    >
                      <span>❌</span>
                      Bỏ chọn hết
                    </button>
                  </div>
                </div>

                {/* Selection Summary */}
                <div className={styles.selectionSummaryCard}>
                  <div className={styles.summaryLeft}>
                    <span className={styles.selectedEmoji}>👥</span>
                    <span className={styles.selectedText}>
                      {isEditing ? "Tham gia:" : "Đã chọn"}{" "}
                      <strong>{selectedMembers.length}</strong>{" "}
                      {!isEditing && `/ ${members.length}`} người
                    </span>
                  </div>
                  {selectedMembers.length > 0 && totalCost > 0 && (
                    <div className={styles.summaryRight}>
                      <span className={styles.costEmoji}>💰</span>
                      <span className={styles.costText}>
                        Mỗi người:{" "}
                        <strong>
                          {costPerMember.toLocaleString("vi-VN")}đ
                        </strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Payment Summary for editing mode */}
                {isEditing && selectedMembers.length > 0 && (
                  <div className={styles.paymentSummaryCard}>
                    <h4 className={styles.paymentSummaryTitle}>
                      <span>💰</span>
                      Tình Hình Thanh Toán
                    </h4>
                    <div className={styles.paymentStats}>
                      <div className={`${styles.statItem} ${styles.paid}`}>
                        <span className={styles.statIcon}>✅</span>
                        <span className={styles.statLabel}>Đã trả:</span>
                        <span className={styles.statValue}>
                          {paidCount} người
                        </span>
                      </div>
                      <div className={`${styles.statItem} ${styles.unpaid}`}>
                        <span className={styles.statIcon}>⏳</span>
                        <span className={styles.statLabel}>Chưa trả:</span>
                        <span className={styles.statValue}>
                          {unpaidCount} người
                        </span>
                      </div>
                      <div className={`${styles.statItem} ${styles.total}`}>
                        <span className={styles.statIcon}>🧮</span>
                        <span className={styles.statLabel}>Đã thu:</span>
                        <span className={styles.statValue}>
                          {totalCollected.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pre-pay Error */}
                {errors.prePay && (
                  <div className={styles.sectionError}>
                    <span>😅 {errors.prePay}</span>
                  </div>
                )}

                {/* Members Grid */}
                <div className={styles.membersGridFriendly}>
                  {filteredMembers.map(member => {
                    const isPaid =
                      memberPaymentStatus[member.id] || member.hasPaid || false
                    const isSelected = selectedMembers.includes(member.id)
                    const prePay = memberPrePays[member.id]?.amount || 0
                    const prePayCategory =
                      memberPrePays[member.id]?.category || ""
                    const remaining = getMemberRemainingAmount(member.id)

                    return (
                      <div
                        key={member.id}
                        className={`${styles.memberCardFriendly} ${
                          isSelected ? styles.selected : ""
                        } ${isPaid ? styles.paid : ""} ${styles.clickable}`}
                        onClick={() => handleMemberToggle(member.id)}
                      >
                        <input
                          type='checkbox'
                          checked={isSelected}
                          onChange={() => handleMemberToggle(member.id)}
                          className={styles.memberCheckboxHidden}
                          aria-label={`Select ${member.name}`}
                        />
                        <div className={styles.memberSelector}>
                          <div className={styles.memberAvatarFriendly}>
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div className={styles.memberInfoFriendly}>
                            <div className={styles.memberNameFriendly}>
                              {member.name}
                            </div>
                            {member.phone && (
                              <div className={styles.memberPhoneFriendly}>
                                📱 {member.phone}
                              </div>
                            )}
                            {isEditing && member.paidAt && (
                              <div className={styles.paymentTimestamp}>
                                💰{" "}
                                {new Date(member.paidAt).toLocaleDateString(
                                  "vi-VN",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </div>
                            )}
                          </div>
                          <div className={styles.memberActionsFriendly}>
                            {isSelected && (
                              <div className={styles.checkMark}>✓</div>
                            )}
                          </div>
                        </div>

                        {/* ✅ Pre-pay input for selected members */}
                        {isSelected && (
                          <div
                            className={styles.prepaySection}
                            onClick={e => e.stopPropagation()} // Prevent card click
                          >
                            <label className={styles.prepayLabel}>
                              <span className={styles.prepayIcon}>💸</span>
                              <span className={styles.prepayText}>
                                Đã trả trước:
                              </span>
                            </label>

                            {/* Pre-pay category quick select buttons */}
                            <div className={styles.prepayCategoryButtons}>
                              {["Sân", "Cầu", "Nước"].map(category => (
                                <button
                                  key={category}
                                  type='button'
                                  onClick={() => {
                                    handlePrePayChange(
                                      member.id,
                                      prePay,
                                      category
                                    )
                                  }}
                                  className={`${styles.categoryBtn} ${
                                    prePayCategory === category
                                      ? styles.selected
                                      : ""
                                  }`}
                                >
                                  {category === "Sân" && "🏟️"}
                                  {category === "Cầu" && "🏸"}
                                  {category === "Nước" && "💧"}
                                  <span>{category}</span>
                                </button>
                              ))}
                            </div>

                            <div className={styles.prepayInputWrapper}>
                              <div className={styles.inputPrefix}>×1000</div>
                              <input
                                type='text'
                                value={
                                  prePay === 0 ? "" : (prePay / 1000).toString()
                                }
                                onFocus={e => e.target.select()}
                                onChange={e => {
                                  const value = e.target.value.replace(
                                    /[^0-9]/g,
                                    ""
                                  ) // Only allow numbers
                                  handlePrePayChange(
                                    member.id,
                                    value === "" ? 0 : Number(value) * 1000
                                  )
                                }}
                                className={styles.prepayInput}
                                placeholder='0'
                              />
                              <span className={styles.prepaySuffix}>đ</span>
                            </div>

                            {/* Show selected category and remaining amount */}
                            {prePay > 0 && (
                              <div className={styles.prepayInfo}>
                                {prePayCategory && (
                                  <div className={styles.prepayCategory}>
                                    Trả cho: <strong>{prePayCategory}</strong>
                                  </div>
                                )}
                                <div className={styles.prepayRemaining}>
                                  {remaining >= 0 ? (
                                    <>
                                      Còn cần trả:{" "}
                                      <strong>
                                        {remaining.toLocaleString("vi-VN")}đ
                                      </strong>
                                    </>
                                  ) : (
                                    <>
                                      Trả thừa:{" "}
                                      <strong className={styles.overpaid}>
                                        {Math.abs(remaining).toLocaleString(
                                          "vi-VN"
                                        )}
                                        đ
                                      </strong>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Payment Toggle - Only show in editing mode */}
                        {isEditing && isSelected && (
                          <div onClick={e => e.stopPropagation()}>
                            {" "}
                            {/* Prevent card click */}
                            <EditableContent
                              viewContent={
                                <div className={styles.paymentViewOnly}>
                                  <span className={styles.paymentIcon}>
                                    {isPaid ? "💰" : "💸"}
                                  </span>
                                  <span className={styles.paymentText}>
                                    {isPaid ? "Đã trả" : "Chưa trả"}
                                  </span>
                                  <span className={styles.paymentAmount}>
                                    {remaining >= 0
                                      ? `${remaining.toLocaleString("vi-VN")}đ`
                                      : `Trả thừa ${Math.abs(
                                          remaining
                                        ).toLocaleString("vi-VN")}đ`}
                                  </span>
                                  <div className={styles.viewOnlyBadge}>
                                    👁️ Chỉ xem
                                  </div>
                                </div>
                              }
                            >
                              <div className={styles.paymentToggleSection}>
                                <button
                                  type='button'
                                  onClick={() => handlePaymentToggle(member.id)}
                                  className={`${styles.paymentToggleBtn} ${
                                    isPaid ? styles.paid : styles.unpaid
                                  }`}
                                  title={
                                    isPaid
                                      ? "Đã thanh toán - Click để đánh dấu chưa trả"
                                      : "Chưa thanh toán - Click để đánh dấu đã trả"
                                  }
                                >
                                  <div className={styles.paymentIcon}>
                                    {isPaid ? "💰" : "💸"}
                                  </div>
                                  <div className={styles.paymentText}>
                                    {isPaid ? "Đã trả" : "Chưa trả"}
                                  </div>
                                  <div className={styles.paymentAmount}>
                                    {remaining >= 0
                                      ? `${remaining.toLocaleString("vi-VN")}đ`
                                      : `Trả thừa ${Math.abs(
                                          remaining
                                        ).toLocaleString("vi-VN")}đ`}
                                  </div>
                                </button>
                              </div>
                            </EditableContent>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {filteredMembers.length === 0 && searchTerm && (
                  <div className={styles.noResultsCard}>
                    <div className={styles.noResultsIcon}>🔍</div>
                    <p>Không tìm thấy ai với tên "{searchTerm}"</p>
                    <p>Thử tìm với từ khóa khác nhé!</p>
                  </div>
                )}

                {errors.members && (
                  <div className={styles.sectionError}>
                    <span>😅 {errors.members}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit Section */}
        {members.length > 0 && (
          <div className={styles.submitSection}>
            <div className={styles.submitCard}>
              <div className={styles.submitSummary}>
                <h4>
                  🎯{" "}
                  {isEditing
                    ? "Sẵn sàng cập nhật?"
                    : "Sẵn sàng ghi nhận trận đấu?"}
                </h4>
                <div className={styles.summaryDetails}>
                  <div className={styles.detailItem}>
                    <span>📅</span>
                    <span>
                      {new Date(date).toLocaleDateString("vi-VN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span>📍</span>
                    <span>{location || "Chưa nhập địa điểm"}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span>👥</span>
                    <span>{selectedMembers.length} người tham gia</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span>💰</span>
                    <span>Tổng: {totalCost.toLocaleString("vi-VN")}đ</span>
                  </div>
                  {/* ✅ Show pre-pay summary in submit section */}
                  {getTotalPrePaid() > 0 && (
                    <div className={styles.detailItem}>
                      <span>💸</span>
                      <span>
                        Đã trả trước:{" "}
                        {getTotalPrePaid().toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  )}
                  {getTotalRemaining() !== totalCost && (
                    <div className={styles.detailItem}>
                      <span>🎯</span>
                      <span>
                        Còn cần thu:{" "}
                        {getTotalRemaining().toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  )}
                  {isEditing && (
                    <div className={styles.detailItem}>
                      <span>✅</span>
                      <span>
                        Đã thu: {totalCollected.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <EditableContent
                viewContent={
                  <div className={styles.submitViewOnly}>
                    <div className={styles.authViewOnly}>
                      <span className={styles.authIcon}>👁️</span>
                      <h3>Chế độ xem</h3>
                      <p>
                        Bạn chỉ có quyền xem. Liên hệ quản trị viên để{" "}
                        {isEditing ? "chỉnh sửa" : "tạo"} trận đấu.
                      </p>
                    </div>
                  </div>
                }
              >
                <button
                  type='submit'
                  disabled={
                    isSubmitting ||
                    Object.keys(errors).length > 0 ||
                    selectedMembers.length === 0
                  }
                  onClick={e => {
                    // If button is disabled due to errors, show validation and scroll to first error
                    const hasErrors =
                      Object.keys(errors).length > 0 ||
                      selectedMembers.length === 0
                    if (hasErrors && !isSubmitting) {
                      e.preventDefault()
                      scrollToFirstError()
                      return
                    }
                  }}
                  className={`${styles.submitBtnFriendly} ${
                    isSubmitting ? "loading" : ""
                  } ${
                    Object.keys(errors).length > 0 ||
                    selectedMembers.length === 0
                      ? "disabled"
                      : ""
                  }`}
                >
                  {isSubmitting ? (
                    <div className={styles.btnLoading}>
                      <div className={styles.spinnerFriendly}></div>
                      <span>
                        {isEditing ? "Đang cập nhật..." : "Đang ghi nhận..."}
                      </span>
                    </div>
                  ) : (
                    <div className={styles.btnContentFriendly}>
                      <span className={styles.btnEmoji}>🎯</span>
                      <span>
                        {isEditing ? "Cập nhật trận đấu" : "Ghi nhận trận đấu"}
                      </span>
                      <div className={styles.btnSparkle}>✨</div>
                    </div>
                  )}
                </button>

                {/* Show validation errors summary when button is disabled */}
                {(Object.keys(errors).length > 0 ||
                  selectedMembers.length === 0) &&
                  !isSubmitting && (
                    <div className={styles.validationSummary}>
                      <div className={styles.validationTitle}>
                        <span>⚠️</span>
                        Vui lòng kiểm tra các lỗi sau:
                      </div>
                      <ul className={styles.validationList}>
                        {selectedMembers.length === 0 && (
                          <li>Chưa chọn thành viên tham gia</li>
                        )}
                        {Object.entries(errors).map(([field, message]) => (
                          <li key={field}>{message}</li>
                        ))}
                      </ul>
                      <button
                        type='button'
                        onClick={scrollToFirstError}
                        className={styles.goToErrorBtn}
                      >
                        📍 Đi đến lỗi đầu tiên
                      </button>
                    </div>
                  )}
              </EditableContent>

              <div className={styles.submitTips}>
                <div className={styles.tipItem}>
                  <span>💡</span>
                  <span>Kiểm tra kỹ thông tin trước khi gửi nhé!</span>
                </div>
                <div className={styles.tipItem}>
                  <span>🔒</span>
                  <span>Dữ liệu của bạn được lưu trữ an toàn</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

export default GameForm
