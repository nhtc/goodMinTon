"use client"
import React, { useState, useEffect } from "react"
import { apiService } from "../lib/api"
import _ from "lodash"

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
  const [memberPrePays, setMemberPrePays] = useState<{ [key: string]: number }>(
    {}
  ) // ✅ New state for pre-pays
  const [totalCost, setTotalCost] = useState<number>(0)
  const [costPerMember, setCostPerMember] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [success, setSuccess] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [memberPaymentStatus, setMemberPaymentStatus] = useState<{
    [key: string]: boolean
  }>({})

  // Preset values for quick selection
  const presetCosts = [
    { label: "🏟️ 2H Hưng Phú", value: 160000, icon: "🏢" },
    { label: "👑 2H Sân Khác", value: 240000, icon: "✨" },
  ]

  const presetShuttlecocks = [
    { label: "🏃‍♂️ Cầu 88", quantity: 1, price: 24000, icon: "💪" },
    { label: "🏸 Vinawin Loai 2", quantity: 1, price: 18000, icon: "🎯" },
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
        const prePayMap: { [key: string]: number } = {}
        gameData.participants.forEach((participant: any) => {
          paymentMap[participant.id] = participant.hasPaid || false
          prePayMap[participant.id] = participant.prePaid || 0 // ✅ Load pre-pays
        })
        setMemberPaymentStatus(paymentMap)
        setMemberPrePays(prePayMap)
      }
    }
  }, [isEditing, gameData])

  const handleMemberToggle = (memberId: string) => {
    if (isEditing) return // Disable member selection in edit mode

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
    if (isEditing) return
    setSelectedMembers(members.map(member => member.id))
    setErrors(prev => _.omit(prev, "members"))
  }

  const clearAllMembers = () => {
    if (isEditing) return
    setSelectedMembers([])
    setMemberPrePays({}) // Clear all pre-pays when clearing members
  }

  // ✅ Handle pre-pay input changes
  const handlePrePayChange = (memberId: string, amount: number) => {
    setMemberPrePays(prev => ({
      ...prev,
      [memberId]: Math.max(0, amount), // Ensure non-negative
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

  // ✅ Calculate remaining amounts for each member
  const getMemberRemainingAmount = (memberId: string) => {
    const prePay = memberPrePays[memberId] || 0
    return Math.max(0, costPerMember - prePay)
  }

  // ✅ Calculate total pre-paid amount
  const getTotalPrePaid = () => {
    return selectedMembers.reduce((sum, memberId) => {
      return sum + (memberPrePays[memberId] || 0)
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

    if (otherFees < 0) {
      newErrors.otherFees = "Chi phí khác không được âm"
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

    // ✅ Validate pre-pays
    selectedMembers.forEach(memberId => {
      const prePay = memberPrePays[memberId] || 0
      if (prePay > costPerMember) {
        const member = members.find(m => m.id === memberId)
        newErrors.prePay = `${
          member?.name
        } đã trả trước quá nhiều (${prePay.toLocaleString(
          "vi-VN"
        )}đ > ${costPerMember.toLocaleString("vi-VN")}đ)`
      }
    })

    // Validate total cost
    if (totalCost <= 0) {
      newErrors.totalCost = "Tổng chi phí phải lớn hơn 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess("")

    if (!validateForm()) {
      const firstErrorElement = document.querySelector(
        ".field-error, .section-error"
      )
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      }
      return
    }

    setIsSubmitting(true)

    try {
      if (isEditing && gameData) {
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
          memberPrePays, // ✅ Include pre-pays
        })
        setSuccess("🎉 Cập nhật trận đấu thành công!")
      } else {
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
          memberPrePays, // ✅ Include pre-pays
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
    <div className='game-form-container'>
      {/* Friendly Header */}
      <div className='form-header-friendly'>
        <div className='header-emoji'>🏸</div>
        <div className='header-content'>
          <h2 className='header-title'>
            {isEditing ? "Chỉnh Sửa Trận Đấu" : "Ghi Nhận Trận Đấu Mới"}
          </h2>
          <p className='header-subtitle'>
            {isEditing
              ? "Cập nhật thông tin và theo dõi thanh toán! 💰"
              : "Hãy điền thông tin về trận cầu lông vừa chơi nhé! 😊"}
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className='alert success-alert bounce-in'>
          <div className='alert-icon'>🎉</div>
          <div className='alert-content'>
            <div className='alert-title'>Tuyệt vời!</div>
            <div className='alert-message'>{success}</div>
          </div>
          <div className='success-confetti'>
            <span>🎊</span>
            <span>✨</span>
            <span>🎉</span>
          </div>
        </div>
      )}

      {/* Global Error */}
      {errors.submit && (
        <div className='alert error-alert shake'>
          <div className='alert-icon'>😅</div>
          <div className='alert-content'>
            <div className='alert-title'>Oops! Có lỗi xảy ra</div>
            <div className='alert-message'>{errors.submit}</div>
          </div>
          <button
            onClick={() => setErrors(prev => _.omit(prev, "submit"))}
            className='alert-close'
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className='game-form-friendly'>
        {/* Section 1: Basic Info */}
        <div className='form-section'>
          <div className='section-header'>
            <div className='section-icon'>📅</div>
            <div className='section-title'>
              <h3>Thông Tin Cơ Bản</h3>
              <p>Cho chúng mình biết khi nào và ở đâu bạn chơi nhé!</p>
            </div>
          </div>

          <div className='section-content'>
            <div className='form-row'>
              <div className='field-group'>
                <label htmlFor='date' className='field-label friendly'>
                  <span className='label-icon'>📅</span>
                  <span className='label-text'>Ngày chơi</span>
                  <span className='required-star'>*</span>
                </label>
                <div className='input-wrapper'>
                  <input
                    type='date'
                    id='date'
                    value={date}
                    onChange={e => {
                      setDate(e.target.value)
                      if (errors.date) setErrors(prev => _.omit(prev, "date"))
                    }}
                    className={`form-input friendly ${
                      errors.date ? "error" : ""
                    }`}
                    max={new Date().toISOString().split("T")[0]}
                  />
                  <div className='input-glow'></div>
                </div>
                {errors.date && (
                  <div className='field-error friendly'>
                    <span>😅 {errors.date}</span>
                  </div>
                )}
              </div>

              <div className='field-group'>
                <label htmlFor='location' className='field-label friendly'>
                  <span className='label-icon'>📍</span>
                  <span className='label-text'>Địa điểm chơi</span>
                  <span className='required-star'>*</span>
                </label>
                <div className='input-wrapper'>
                  <input
                    type='text'
                    id='location'
                    value={location}
                    onChange={e => {
                      setLocation(e.target.value)
                      if (errors.location)
                        setErrors(prev => _.omit(prev, "location"))
                    }}
                    className={`form-input friendly ${
                      errors.location ? "error" : ""
                    } ${location.trim() ? "filled" : ""}`}
                    placeholder='VD: Sân cầu lông ABC, Quận 1 🏟️'
                    maxLength={100}
                  />
                  <div className='input-glow'></div>
                  {location.trim() && <div className='input-check'>✓</div>}
                </div>
                {errors.location && (
                  <div className='field-error friendly'>
                    <span>😅 {errors.location}</span>
                  </div>
                )}
                <div className='field-tip'>
                  <span>💡 Ghi rõ tên sân để lần sau dễ nhớ nha!</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Costs */}
        <div className='form-section'>
          <div className='section-header'>
            <div className='section-icon'>💰</div>
            <div className='section-title'>
              <h3>Chi Phí</h3>
              <p>Hãy nhập chi phí để chia đều cho mọi người!</p>
            </div>
          </div>

          <div className='section-content'>
            {/* Court Cost */}
            <div className='subsection'>
              <h4 className='subsection-title'>
                <span>🏟️</span>
                Chi phí thuê sân
              </h4>

              {/* Preset buttons */}
              <div className='preset-grid'>
                {presetCosts.map((preset, index) => (
                  <button
                    key={index}
                    type='button'
                    onClick={() => {
                      setYardCost(preset.value)
                      if (errors.yardCost)
                        setErrors(prev => _.omit(prev, "yardCost"))
                    }}
                    className={`preset-card ${
                      yardCost === preset.value ? "selected" : ""
                    }`}
                  >
                    <div className='preset-icon'>{preset.icon}</div>
                    <div className='preset-label'>{preset.label}</div>
                    <div className='preset-value'>
                      {preset.value.toLocaleString("vi-VN")}đ
                    </div>
                  </button>
                ))}
              </div>

              <div className='field-group'>
                <label htmlFor='yardCost' className='field-label friendly'>
                  <span className='label-text'>Hoặc nhập số tiền khác</span>
                </label>
                <div className='input-wrapper money'>
                  <input
                    type='number'
                    id='yardCost'
                    value={yardCost}
                    onChange={e => {
                      setYardCost(Number(e.target.value))
                      if (errors.yardCost)
                        setErrors(prev => _.omit(prev, "yardCost"))
                    }}
                    className={`form-input friendly money ${
                      errors.yardCost ? "error" : ""
                    } ${yardCost > 0 ? "filled" : ""}`}
                    min='0'
                    max='1000000'
                    placeholder='0'
                  />
                  <div className='input-suffix money'>đ</div>
                  <div className='input-glow'></div>
                </div>
                {errors.yardCost && (
                  <div className='field-error friendly'>
                    <span>😅 {errors.yardCost}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shuttlecock Section */}
            <div className='subsection'>
              <h4 className='subsection-title'>
                <span>🏸</span>
                Chi phí cầu lông
              </h4>

              {/* Preset shuttlecock combinations */}
              <div className='preset-grid'>
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
                    className={`preset-card ${
                      shuttleCockQuantity === preset.quantity &&
                      shuttleCockPrice === preset.price
                        ? "selected"
                        : ""
                    }`}
                  >
                    <div className='preset-icon'>{preset.icon}</div>
                    <div className='preset-label'>{preset.label}</div>
                    <div className='preset-detail'>
                      {preset.quantity} quả ×{" "}
                      {preset.price.toLocaleString("vi-VN")}đ
                    </div>
                    <div className='preset-total'>
                      ={" "}
                      {(preset.quantity * preset.price).toLocaleString("vi-VN")}
                      đ
                    </div>
                  </button>
                ))}
              </div>

              <div className='form-row'>
                <div className='field-group'>
                  <label
                    htmlFor='shuttleCockQuantity'
                    className='field-label friendly'
                  >
                    <span className='label-icon'>🔢</span>
                    <span className='label-text'>Số lượng cầu</span>
                  </label>
                  <div className='input-wrapper'>
                    <input
                      type='number'
                      id='shuttleCockQuantity'
                      value={shuttleCockQuantity}
                      onChange={e => {
                        setShuttleCockQuantity(Number(e.target.value))
                        if (errors.shuttleCockQuantity)
                          setErrors(prev => _.omit(prev, "shuttleCockQuantity"))
                      }}
                      className={`form-input friendly ${
                        errors.shuttleCockQuantity ? "error" : ""
                      }`}
                      min='0'
                      max='20'
                      placeholder='0'
                    />
                    <div className='input-suffix'>quả</div>
                    <div className='input-glow'></div>
                  </div>
                  {errors.shuttleCockQuantity && (
                    <div className='field-error friendly'>
                      <span>😅 {errors.shuttleCockQuantity}</span>
                    </div>
                  )}
                </div>

                <div className='field-group'>
                  <label
                    htmlFor='shuttleCockPrice'
                    className='field-label friendly'
                  >
                    <span className='label-icon'>💰</span>
                    <span className='label-text'>Giá mỗi quả</span>
                  </label>
                  <div className='input-wrapper money'>
                    <input
                      type='number'
                      id='shuttleCockPrice'
                      value={shuttleCockPrice}
                      onChange={e => {
                        setShuttleCockPrice(Number(e.target.value))
                        if (errors.shuttleCockPrice)
                          setErrors(prev => _.omit(prev, "shuttleCockPrice"))
                      }}
                      className={`form-input friendly money ${
                        errors.shuttleCockPrice ? "error" : ""
                      }`}
                      min='0'
                      max='100000'
                      placeholder='15000'
                    />
                    <div className='input-suffix money'>đ</div>
                    <div className='input-glow'></div>
                  </div>
                  {errors.shuttleCockPrice && (
                    <div className='field-error friendly'>
                      <span>😅 {errors.shuttleCockPrice}</span>
                    </div>
                  )}
                </div>
              </div>

              {shuttleCockQuantity > 0 && shuttleCockPrice > 0 && (
                <div className='calculation-result'>
                  <span className='calc-label'>Tổng tiền cầu:</span>
                  <span className='calc-value'>
                    {(shuttleCockQuantity * shuttleCockPrice).toLocaleString(
                      "vi-VN"
                    )}
                    đ
                  </span>
                </div>
              )}
            </div>

            {/* Other Fees */}
            <div className='field-group'>
              <label htmlFor='otherFees' className='field-label friendly'>
                <span className='label-icon'>📋</span>
                <span className='label-text'>Chi phí khác</span>
                <span className='optional-badge'>không bắt buộc</span>
              </label>
              <div className='input-wrapper money'>
                <input
                  type='number'
                  id='otherFees'
                  value={otherFees}
                  onChange={e => {
                    setOtherFees(Number(e.target.value))
                    if (errors.otherFees)
                      setErrors(prev => _.omit(prev, "otherFees"))
                  }}
                  className={`form-input friendly money ${
                    errors.otherFees ? "error" : ""
                  } ${otherFees > 0 ? "filled" : ""}`}
                  min='0'
                  max='500000'
                  placeholder='0'
                />
                <div className='input-suffix money'>đ</div>
                <div className='input-glow'></div>
              </div>
              {errors.otherFees && (
                <div className='field-error friendly'>
                  <span>😅 {errors.otherFees}</span>
                </div>
              )}
              <div className='field-tip'>
                <span>💡 VD: Đậu xe, nước uống, vé vào cổng...</span>
              </div>
            </div>

            {/* Cost Summary */}
            {totalCost > 0 && (
              <div className='cost-summary-card'>
                <h4 className='summary-title'>
                  <span>💳</span>
                  Tổng quan chi phí
                </h4>
                <div className='cost-breakdown'>
                  <div className='cost-item'>
                    <span className='cost-icon'>🏟️</span>
                    <span className='cost-label'>Thuê sân:</span>
                    <span className='cost-value'>
                      {yardCost.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  {shuttleCockQuantity > 0 && (
                    <div className='cost-item'>
                      <span className='cost-icon'>🏸</span>
                      <span className='cost-label'>Cầu lông:</span>
                      <span className='cost-value'>
                        {(
                          shuttleCockQuantity * shuttleCockPrice
                        ).toLocaleString("vi-VN")}
                        đ
                      </span>
                    </div>
                  )}
                  {otherFees > 0 && (
                    <div className='cost-item'>
                      <span className='cost-icon'>📋</span>
                      <span className='cost-label'>Chi phí khác:</span>
                      <span className='cost-value'>
                        {otherFees.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  )}
                  <div className='cost-total'>
                    <span className='total-icon'>🧮</span>
                    <span className='total-label'>Tổng cộng:</span>
                    <span className='total-value'>
                      {totalCost.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  {selectedMembers.length > 0 && (
                    <div className='cost-per-person'>
                      <span className='person-icon'>👤</span>
                      <span className='person-label'>Mỗi người:</span>
                      <span className='person-value'>
                        {costPerMember.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  )}
                  {/* ✅ Add pre-pay summary */}
                  {selectedMembers.length > 0 && getTotalPrePaid() > 0 && (
                    <div className='prepay-summary'>
                      <div className='cost-item prepay'>
                        <span className='cost-icon'>💸</span>
                        <span className='cost-label'>Đã trả trước:</span>
                        <span className='cost-value'>
                          -{getTotalPrePaid().toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                      <div className='cost-item remaining'>
                        <span className='cost-icon'>💰</span>
                        <span className='cost-label'>Còn cần thu:</span>
                        <span className='cost-value'>
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
        <div className='form-section'>
          <div className='section-header'>
            <div className='section-icon'>👥</div>
            <div className='section-title'>
              <h3>Thành Viên Tham Gia</h3>
              <p>
                {isEditing
                  ? "Theo dõi và cập nhật trạng thái thanh toán!"
                  : "Chọn những người bạn chơi cùng và nhập số tiền đã trả trước (nếu có)!"}
              </p>
            </div>
          </div>

          <div className='section-content'>
            {members.length === 0 ? (
              <div className='empty-members-card'>
                <div className='empty-icon'>😕</div>
                <h4>Chưa có thành viên nào</h4>
                <p>Bạn cần thêm thành viên trước khi ghi nhận trận đấu</p>
                <button
                  type='button'
                  onClick={() => (window.location.href = "/members")}
                  className='btn-add-members'
                >
                  <span>➕</span>
                  Thêm thành viên ngay
                </button>
              </div>
            ) : (
              <div className='members-section-content'>
                {/* Search and Quick Actions */}
                <div className='members-controls'>
                  <div className='search-wrapper-friendly'>
                    <div className='search-icon'>🔍</div>
                    <input
                      type='text'
                      placeholder='Tìm tên thành viên...'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className='search-input-friendly'
                    />
                    {searchTerm && (
                      <button
                        type='button'
                        onClick={() => setSearchTerm("")}
                        className='search-clear-friendly'
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {!isEditing && (
                    <div className='member-quick-actions'>
                      <button
                        type='button'
                        onClick={selectAllMembers}
                        className='quick-action-btn select-all'
                        disabled={selectedMembers.length === members.length}
                      >
                        <span>✅</span>
                        Chọn tất cả
                      </button>
                      <button
                        type='button'
                        onClick={clearAllMembers}
                        className='quick-action-btn clear-all'
                        disabled={selectedMembers.length === 0}
                      >
                        <span>❌</span>
                        Bỏ chọn hết
                      </button>
                    </div>
                  )}
                </div>

                {/* Selection Summary */}
                <div className='selection-summary-card'>
                  <div className='summary-left'>
                    <span className='selected-emoji'>👥</span>
                    <span className='selected-text'>
                      {isEditing ? "Tham gia:" : "Đã chọn"}{" "}
                      <strong>{selectedMembers.length}</strong>{" "}
                      {!isEditing && `/ ${members.length}`} người
                    </span>
                  </div>
                  {selectedMembers.length > 0 && totalCost > 0 && (
                    <div className='summary-right'>
                      <span className='cost-emoji'>💰</span>
                      <span className='cost-text'>
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
                  <div className='payment-summary-card'>
                    <h4 className='payment-summary-title'>
                      <span>💰</span>
                      Tình Hình Thanh Toán
                    </h4>
                    <div className='payment-stats'>
                      <div className='stat-item paid'>
                        <span className='stat-icon'>✅</span>
                        <span className='stat-label'>Đã trả:</span>
                        <span className='stat-value'>{paidCount} người</span>
                      </div>
                      <div className='stat-item unpaid'>
                        <span className='stat-icon'>⏳</span>
                        <span className='stat-label'>Chưa trả:</span>
                        <span className='stat-value'>{unpaidCount} người</span>
                      </div>
                      <div className='stat-item total'>
                        <span className='stat-icon'>🧮</span>
                        <span className='stat-label'>Đã thu:</span>
                        <span className='stat-value'>
                          {totalCollected.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pre-pay Error */}
                {errors.prePay && (
                  <div className='section-error'>
                    <span>😅 {errors.prePay}</span>
                  </div>
                )}

                {/* Members Grid */}
                <div className='members-grid-friendly'>
                  {filteredMembers.map(member => {
                    const isPaid =
                      memberPaymentStatus[member.id] || member.hasPaid || false
                    const isSelected = selectedMembers.includes(member.id)
                    const prePay = memberPrePays[member.id] || 0
                    const remaining = getMemberRemainingAmount(member.id)

                    return (
                      <div
                        key={member.id}
                        className={`member-card-friendly ${
                          isSelected ? "selected" : ""
                        } ${isPaid ? "paid" : ""}`}
                      >
                        <label
                          className='member-selector'
                          onClick={e => {
                            if (isEditing) e.preventDefault()
                          }}
                        >
                          <input
                            type='checkbox'
                            checked={isSelected}
                            onChange={() => handleMemberToggle(member.id)}
                            className='member-checkbox-hidden'
                            disabled={isEditing}
                          />
                          <div className='member-avatar-friendly'>
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div className='member-info-friendly'>
                            <div className='member-name-friendly'>
                              {member.name}
                            </div>
                            {member.phone && (
                              <div className='member-phone-friendly'>
                                📱 {member.phone}
                              </div>
                            )}
                            {isEditing && member.paidAt && (
                              <div className='payment-timestamp'>
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
                          <div className='member-actions-friendly'>
                            {isSelected && !isEditing && (
                              <div className='check-mark'>✓</div>
                            )}
                          </div>
                        </label>

                        {/* ✅ Pre-pay input for selected members */}
                        {isSelected && !isEditing && (
                          <div className='prepay-section'>
                            <label className='prepay-label'>
                              <span className='prepay-icon'>💸</span>
                              <span className='prepay-text'>Đã trả trước:</span>
                            </label>
                            <div className='prepay-input-wrapper'>
                              <input
                                type='number'
                                value={prePay}
                                onChange={e =>
                                  handlePrePayChange(
                                    member.id,
                                    Number(e.target.value)
                                  )
                                }
                                className='prepay-input'
                                min='0'
                                max={costPerMember}
                                placeholder='0'
                              />
                              <span className='prepay-suffix'>đ</span>
                            </div>
                            {prePay > 0 && (
                              <div className='prepay-remaining'>
                                Còn cần trả:{" "}
                                <strong>
                                  {remaining.toLocaleString("vi-VN")}đ
                                </strong>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Payment Toggle - Only show in editing mode */}
                        {isEditing && isSelected && (
                          <div className='payment-toggle-section'>
                            <button
                              type='button'
                              onClick={() => handlePaymentToggle(member.id)}
                              className={`payment-toggle-btn ${
                                isPaid ? "paid" : "unpaid"
                              }`}
                              title={
                                isPaid
                                  ? "Đã thanh toán - Click để đánh dấu chưa trả"
                                  : "Chưa thanh toán - Click để đánh dấu đã trả"
                              }
                            >
                              <div className='payment-icon'>
                                {isPaid ? "💰" : "💸"}
                              </div>
                              <div className='payment-text'>
                                {isPaid ? "Đã trả" : "Chưa trả"}
                              </div>
                              <div className='payment-amount'>
                                {remaining > 0
                                  ? `${remaining.toLocaleString("vi-VN")}đ`
                                  : "Hoàn thành"}
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {filteredMembers.length === 0 && searchTerm && (
                  <div className='no-results-card'>
                    <div className='no-results-icon'>🔍</div>
                    <p>Không tìm thấy ai với tên "{searchTerm}"</p>
                    <p>Thử tìm với từ khóa khác nhé!</p>
                  </div>
                )}

                {errors.members && (
                  <div className='section-error'>
                    <span>😅 {errors.members}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit Section */}
        {members.length > 0 && (
          <div className='submit-section'>
            <div className='submit-card'>
              <div className='submit-summary'>
                <h4>
                  🎯{" "}
                  {isEditing
                    ? "Sẵn sàng cập nhật?"
                    : "Sẵn sàng ghi nhận trận đấu?"}
                </h4>
                <div className='summary-details'>
                  <div className='detail-item'>
                    <span>📅</span>
                    <span>
                      {new Date(date).toLocaleDateString("vi-VN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </span>
                  </div>
                  <div className='detail-item'>
                    <span>📍</span>
                    <span>{location || "Chưa nhập địa điểm"}</span>
                  </div>
                  <div className='detail-item'>
                    <span>👥</span>
                    <span>{selectedMembers.length} người tham gia</span>
                  </div>
                  <div className='detail-item'>
                    <span>💰</span>
                    <span>Tổng: {totalCost.toLocaleString("vi-VN")}đ</span>
                  </div>
                  {/* ✅ Show pre-pay summary in submit section */}
                  {getTotalPrePaid() > 0 && (
                    <div className='detail-item'>
                      <span>💸</span>
                      <span>
                        Đã trả trước:{" "}
                        {getTotalPrePaid().toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  )}
                  {getTotalRemaining() !== totalCost && (
                    <div className='detail-item'>
                      <span>🎯</span>
                      <span>
                        Còn cần thu:{" "}
                        {getTotalRemaining().toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  )}
                  {isEditing && (
                    <div className='detail-item'>
                      <span>✅</span>
                      <span>
                        Đã thu: {totalCollected.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type='submit'
                disabled={
                  isSubmitting ||
                  Object.keys(errors).length > 0 ||
                  selectedMembers.length === 0
                }
                className={`submit-btn-friendly ${
                  isSubmitting ? "loading" : ""
                } ${
                  Object.keys(errors).length > 0 || selectedMembers.length === 0
                    ? "disabled"
                    : ""
                }`}
              >
                {isSubmitting ? (
                  <div className='btn-loading'>
                    <div className='spinner-friendly'></div>
                    <span>
                      {isEditing ? "Đang cập nhật..." : "Đang ghi nhận..."}
                    </span>
                  </div>
                ) : (
                  <div className='btn-content-friendly'>
                    <span className='btn-emoji'>🎯</span>
                    <span>
                      {isEditing ? "Cập nhật trận đấu" : "Ghi nhận trận đấu"}
                    </span>
                    <div className='btn-sparkle'>✨</div>
                  </div>
                )}
              </button>

              <div className='submit-tips'>
                <div className='tip-item'>
                  <span>💡</span>
                  <span>Kiểm tra kỹ thông tin trước khi gửi nhé!</span>
                </div>
                <div className='tip-item'>
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
