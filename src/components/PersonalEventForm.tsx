"use client"
import React, { useState, useEffect, useMemo } from 'react'
import _ from 'lodash'
import styles from './PersonalEventForm.module.css'
import MemberAutocomplete from './MemberAutocomplete'
import { useMembers } from '@/hooks/useQueries'
import type { 
  Member, 
  PersonalEventFormData, 
  CreatePersonalEventData, 
  UpdatePersonalEventData,
  PersonalEvent 
} from '../types'

interface PersonalEventFormProps {
  onSubmit: (data: CreatePersonalEventData | UpdatePersonalEventData) => Promise<void>
  initialData?: PersonalEvent
  isEditing?: boolean
  isSubmitting?: boolean
  className?: string
}

interface FormErrors {
  title?: string
  date?: string
  participants?: string
  totalCost?: string
  totalAmount?: string
}

const PersonalEventForm: React.FC<PersonalEventFormProps> = ({
  onSubmit,
  initialData,
  isEditing = false,
  isSubmitting = false,
  className = ""
}) => {
  // Fetch members data using shared hook
  const { data: members = [], isLoading: membersLoading, error: membersError } = useMembers()
  // Form state
  const [title, setTitle] = useState(initialData?.title || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [date, setDate] = useState(() => {
    if (initialData?.date) {
      return new Date(initialData.date).toISOString().slice(0, 16)
    }
    return new Date().toISOString().slice(0, 16)
  })
  const [location, setLocation] = useState(initialData?.location || "")
  const [totalAmount, setTotalAmount] = useState(initialData?.totalCost || 0)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [memberCustomAmounts, setMemberCustomAmounts] = useState<Record<string, number>>({})
  const [memberPrepaidAmounts, setMemberPrepaidAmounts] = useState<Record<string, number>>({})
  const [memberPrepaidCategories, setMemberPrepaidCategories] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<FormErrors>({})
  const [searchTerm, setSearchTerm] = useState("")

  // Calculate member totals (amount each member needs to pay after prepaid)
  const memberTotal = useMemo(() => {
    return selectedMembers.reduce((total, memberId) => {
      const customAmount = memberCustomAmounts[memberId] || 0
      const prepaidAmount = memberPrepaidAmounts[memberId] || 0
      return total + (customAmount - prepaidAmount)
    }, 0)
  }, [selectedMembers, memberCustomAmounts, memberPrepaidAmounts])

  // Calculate total custom amounts (before prepaid)
  const totalCustomAmounts = useMemo(() => {
    return selectedMembers.reduce((total, memberId) => {
      return total + (memberCustomAmounts[memberId] || 0)
    }, 0)
  }, [selectedMembers, memberCustomAmounts])

  // Calculate total prepaid amounts
  const totalPrepaidAmounts = useMemo(() => {
    return selectedMembers.reduce((total, memberId) => {
      return total + (memberPrepaidAmounts[memberId] || 0)
    }, 0)
  }, [selectedMembers, memberPrepaidAmounts])

  // Initialize form with existing data
  useEffect(() => {
    if (initialData && isEditing) {
      setTitle(initialData.title)
      setDescription(initialData.description || "")
      setDate(new Date(initialData.date).toISOString().slice(0, 16))
      setLocation(initialData.location || "")
      setTotalAmount(initialData.totalCost || 0)
      
      const participantIds = initialData.participants.map(p => p.memberId)
      setSelectedMembers(participantIds)
      
      const amounts: Record<string, number> = {}
      const prepaidAmounts: Record<string, number> = {}
      const prepaidCategories: Record<string, string> = {}
      
      initialData.participants.forEach(p => {
        amounts[p.memberId] = p.customAmount
        prepaidAmounts[p.memberId] = p.prePaid || 0
        prepaidCategories[p.memberId] = p.prePaidCategory || ""
      })
      
      setMemberCustomAmounts(amounts)
      setMemberPrepaidAmounts(prepaidAmounts)
      setMemberPrepaidCategories(prepaidCategories)
    }
  }, [initialData, isEditing])

  // Filter members based on search
  const filteredMembers = useMemo(() => {
    if (!searchTerm) return members.filter((m: any) => m.isActive)
    return members.filter((m: any) => 
      m.isActive && 
      (m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       m.phone?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [members, searchTerm])

  // Validation
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {}

    if (!title.trim()) {
      newErrors.title = "Tên sự kiện là bắt buộc"
    }

    if (!date) {
      newErrors.date = "Ngày tổ chức là bắt buộc"
    }

    if (selectedMembers.length === 0) {
      newErrors.participants = "Phải chọn ít nhất một thành viên tham gia"
    }

    if (totalAmount <= 0) {
      newErrors.totalAmount = "Tổng chi phí phải lớn hơn 0"
    }

    return newErrors
  }

  // Event handlers
  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => {
      const isSelected = prev.includes(memberId)
      let newSelected: string[]
      
      if (isSelected) {
        newSelected = prev.filter(id => id !== memberId)
        // Remove custom amount and prepaid data when deselecting member
        setMemberCustomAmounts(prevAmounts => _.omit(prevAmounts, memberId))
        setMemberPrepaidAmounts(prevPrepaid => _.omit(prevPrepaid, memberId))
        setMemberPrepaidCategories(prevCategories => _.omit(prevCategories, memberId))
      } else {
        newSelected = [...prev, memberId]
        // Initialize with 0 - no auto-populate
        setMemberCustomAmounts(prevAmounts => ({
          ...prevAmounts,
          [memberId]: 0
        }))
        setMemberPrepaidAmounts(prevPrepaid => ({
          ...prevPrepaid,
          [memberId]: 0
        }))
        setMemberPrepaidCategories(prevCategories => ({
          ...prevCategories,
          [memberId]: ""
        }))
      }
      
      // Clear participants error if we now have selected members
      if (newSelected.length > 0 && errors.participants) {
        setErrors(prev => _.omit(prev, 'participants'))
      }
      
      return newSelected
    })
  }

  const handleCustomAmountChange = (memberId: string, amount: number) => {
    setMemberCustomAmounts(prev => ({
      ...prev,
      [memberId]: amount
    }))
    
    // Clear total cost error when amounts change
    if (errors.totalCost) {
      setErrors(prev => _.omit(prev, 'totalCost'))
    }
  }

  const handlePrepaidAmountChange = (memberId: string, amount: number) => {
    setMemberPrepaidAmounts(prev => ({
      ...prev,
      [memberId]: amount
    }))
  }

  const handlePrepaidCategoryChange = (memberId: string, category: string) => {
    setMemberPrepaidCategories(prev => ({
      ...prev,
      [memberId]: category
    }))
  }

  const handleCalculateEqualShare = () => {
    if (selectedMembers.length === 0) return
    
    const share = Math.ceil(totalAmount / selectedMembers.length)
    const newAmounts: Record<string, number> = {}
    
    selectedMembers.forEach(memberId => {
      newAmounts[memberId] = share
    })
    
    setMemberCustomAmounts(newAmounts)
  }

  const handleSelectAllMembers = () => {
    const allActiveMembers = members.filter((m: any) => m.isActive).map((m: any) => m.id)
    setSelectedMembers(allActiveMembers)
    
    // Set equal share for all
    const share = Math.ceil(totalAmount / allActiveMembers.length)
    const newAmounts: Record<string, number> = {}
    const newPrepaidAmounts: Record<string, number> = {}
    const newPrepaidCategories: Record<string, string> = {}
    
    allActiveMembers.forEach((memberId: string) => {
      newAmounts[memberId] = share
      newPrepaidAmounts[memberId] = 0
      newPrepaidCategories[memberId] = ""
    })
    
    setMemberCustomAmounts(newAmounts)
    setMemberPrepaidAmounts(newPrepaidAmounts)
    setMemberPrepaidCategories(newPrepaidCategories)
  }

  const handleClearAllMembers = () => {
    setSelectedMembers([])
    setMemberCustomAmounts({})
    setMemberPrepaidAmounts({})
    setMemberPrepaidCategories({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formErrors = validateForm()
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }
    
    setErrors({})

    const formData: CreatePersonalEventData | UpdatePersonalEventData = {
      title: title.trim(),
      description: description.trim() || undefined,
      date: new Date(date).toISOString(),
      location: location.trim() || undefined,
      totalCost: totalAmount,
      participants: selectedMembers.map(memberId => ({
        memberId,
        customAmount: memberCustomAmounts[memberId] || 0,
        hasPaid: false,
        paidAt: undefined,
        prePaid: memberPrepaidAmounts[memberId] || 0,
        prePaidCategory: memberPrepaidCategories[memberId] || ""
      }))
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <div className={`${styles.personalEventFormContainer} ${className}`}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Header Section */}
        <div className={styles.formHeaderFriendly}>
          <div className={styles.headerContent}>
            <div className={styles.headerEmoji}>🎉</div>
            <div>
              <h2 className={styles.headerTitle}>
                {isEditing ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới"}
              </h2>
              <p className={styles.headerSubtitle}>
                {isEditing 
                  ? "Cập nhật thông tin sự kiện và phân chia chi phí"
                  : "Tạo sự kiện và phân chia chi phí cho các thành viên"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Event Information */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>📋</div>
            <div className={styles.sectionTitle}>
              <h3>Thông Tin Sự Kiện</h3>
              <p>Nhập các thông tin cơ bản về sự kiện của bạn</p>
            </div>
          </div>

          <div className={styles.sectionContent}>
            <div className={styles.fieldGroup}>
              <label htmlFor="title" className={`${styles.fieldLabel} ${styles.friendly}`}>
                <span className={styles.labelIcon}>🎯</span>
                <span className={styles.labelText}>Tên sự kiện</span>
                <span className={styles.requiredStar}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    if (errors.title) setErrors(prev => _.omit(prev, 'title'))
                  }}
                  className={`${styles.formInput} ${styles.friendly} ${errors.title ? 'error' : ''}`}
                  placeholder="VD: Tiệc sinh nhật, Đi cà phê, Ăn tối..."
                />
                <div className={styles.inputGlow}></div>
              </div>
              {errors.title && (
                <div className={`${styles.fieldError} ${styles.friendly}`}>
                  <span>😅 {errors.title}</span>
                </div>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="description" className={`${styles.fieldLabel} ${styles.friendly}`}>
                <span className={styles.labelIcon}>📝</span>
                <span className={styles.labelText}>Mô tả (tùy chọn)</span>
              </label>
              <div className={styles.inputWrapper}>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${styles.formTextarea} ${styles.friendly}`}
                  placeholder="Mô tả chi tiết về sự kiện..."
                  rows={3}
                />
                <div className={styles.inputGlow}></div>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.fieldGroup}>
                <label htmlFor="date" className={`${styles.fieldLabel} ${styles.friendly}`}>
                  <span className={styles.labelIcon}>📅</span>
                  <span className={styles.labelText}>Ngày & Giờ</span>
                  <span className={styles.requiredStar}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="datetime-local"
                    id="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value)
                      if (errors.date) setErrors(prev => _.omit(prev, 'date'))
                    }}
                    className={`${styles.formInput} ${styles.friendly} ${errors.date ? 'error' : ''}`}
                  />
                  <div className={styles.inputGlow}></div>
                </div>
                {errors.date && (
                  <div className={`${styles.fieldError} ${styles.friendly}`}>
                    <span>😅 {errors.date}</span>
                  </div>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="location" className={`${styles.fieldLabel} ${styles.friendly}`}>
                  <span className={styles.labelIcon}>📍</span>
                  <span className={styles.labelText}>Địa điểm</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={`${styles.formInput} ${styles.friendly}`}
                    placeholder="VD: Nhà hàng ABC, Quận 1..."
                  />
                  <div className={styles.inputGlow}></div>
                </div>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="totalAmount" className={`${styles.fieldLabel} ${styles.friendly}`}>
                <span className={styles.labelIcon}>💰</span>
                <span className={styles.labelText}>Tổng chi phí</span>
                <span className={styles.requiredStar}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <div className={styles.customAmountInputWrapper}>
                  <input
                    type="text"
                    id="totalAmount"
                    value={totalAmount === 0 ? "" : (totalAmount / 1000).toString()}
                    onFocus={e => e.target.select()}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "")
                      const amount = value === "" ? 0 : Number(value) * 1000
                      setTotalAmount(amount)
                      if (errors.totalAmount) setErrors(prev => _.omit(prev, 'totalAmount'))
                    }}
                    className={`${styles.customAmountInput} ${errors.totalAmount ? 'error' : ''}`}
                    placeholder="0"
                  />
                  <span className={styles.customAmountSuffix}>×1000 đ</span>
                </div>
                <div className={styles.inputGlow}></div>
              </div>
              {errors.totalAmount && (
                <div className={`${styles.fieldError} ${styles.friendly}`}>
                  <span>😅 {errors.totalAmount}</span>
                </div>
              )}
              <div className={styles.fieldTip}>
                <span>💡 Tổng số tiền cần chi cho sự kiện này</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Members Selection */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>👥</div>
            <div className={styles.sectionTitle}>
              <h3>Thành Viên Tham Gia</h3>
              <p>Chọn thành viên và phân chia chi phí tùy chỉnh</p>
            </div>
          </div>

          <div className={styles.sectionContent}>
            {members.filter((m: any) => m.isActive).length === 0 ? (
              <div className={styles.emptyMembersCard}>
                <div className={styles.emptyIcon}>😕</div>
                <h4>Chưa có thành viên nào</h4>
                <p>Bạn cần thêm thành viên trước khi tạo sự kiện</p>
                <button
                  type="button"
                  onClick={() => window.location.href = '/members'}
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
                      type="text"
                      placeholder="Tìm tên thành viên..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={styles.searchInputFriendly}
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className={styles.searchClearFriendly}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className={styles.memberQuickActions}>
                    <button
                      type="button"
                      onClick={handleSelectAllMembers}
                      className={`${styles.quickActionBtn} ${styles.selectAll}`}
                      disabled={selectedMembers.length === members.filter((m: any) => m.isActive).length}
                    >
                      <span>✅</span>
                      Chọn tất cả
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAllMembers}
                      className={`${styles.quickActionBtn} ${styles.clearAll}`}
                      disabled={selectedMembers.length === 0}
                    >
                      <span>❌</span>
                      Bỏ chọn hết
                    </button>
                    <button
                      type="button"
                      onClick={handleCalculateEqualShare}
                      className={`${styles.quickActionBtn} ${styles.equalShare}`}
                      disabled={selectedMembers.length === 0}
                    >
                      <span>⚖️</span>
                      Chia đều
                    </button>
                  </div>
                </div>

                {/* Selection Summary */}
                <div className={styles.selectionSummaryCard}>
                  <div className={styles.summaryLeft}>
                    <span className={styles.selectedEmoji}>👥</span>
                    <span className={styles.selectedText}>
                      Đã chọn <strong>{selectedMembers.length}</strong> / {members.filter((m: any) => m.isActive).length} người
                    </span>
                  </div>
                  {selectedMembers.length > 0 && (
                    <div className={styles.summaryRight}>
                      <span className={styles.costEmoji}>💰</span>
                      <span className={styles.costText}>
                        Ngân sách: <strong>{totalAmount.toLocaleString("vi-VN")}đ</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Member Amount Comparison */}
                {selectedMembers.length > 0 && (
                  <div className={styles.comparisonCard}>
                    <div className={styles.comparisonHeader}>
                      <span className={styles.comparisonIcon}>📊</span>
                      <span className={styles.comparisonTitle}>So sánh chi phí</span>
                    </div>
                    <div className={styles.comparisonContent}>
                      <div className={styles.comparisonRow}>
                        <span>💰 Ngân sách sự kiện:</span>
                        <span className={styles.totalBudget}>{totalAmount.toLocaleString("vi-VN")}đ</span>
                      </div>
                      <div className={styles.comparisonRow}>
                        <span>💳 Tổng đã trả trước:</span>
                        <span className={styles.prepaidTotal}>
                          {totalPrepaidAmounts.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                      <div className={styles.comparisonRow}>
                        <span>�👥 Tổng cần thu:</span>
                        <span className={styles.memberTotal}>
                          {memberTotal.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                      <div className={`${styles.comparisonRow} ${styles.difference}`}>
                        <span>🎯 Chênh lệch (ngân sách - tổng chi phí):</span>
                        <span className={
                          totalAmount - totalCustomAmounts === 0 ? styles.balanced :
                          totalAmount - totalCustomAmounts > 0 ? styles.underAllocated : styles.overAllocated
                        }>
                          {Math.abs(totalAmount - totalCustomAmounts).toLocaleString("vi-VN")}đ
                          {totalAmount - totalCustomAmounts === 0 && " ✅"}
                          {totalAmount - totalCustomAmounts > 0 && " (phân bổ thiếu)"}
                          {totalAmount - totalCustomAmounts < 0 && " (phân bổ thừa)"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Members Grid */}
                <div className={styles.membersGridFriendly}>
                  {filteredMembers.map((member: any) => {
                    const isSelected = selectedMembers.includes(member.id)
                    const customAmount = memberCustomAmounts[member.id] || 0

                    return (
                      <div
                        key={member.id}
                        className={`${styles.memberCardFriendly} ${isSelected ? styles.selected : ''} ${styles.clickable}`}
                        onClick={() => handleMemberToggle(member.id)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleMemberToggle(member.id)}
                          className={styles.memberCheckboxHidden}
                          aria-label={`Select ${member.name}`}
                        />
                        
                        <div className={styles.memberSelector}>
                          <div className={styles.memberAvatarFriendly}>
                            {member.avatar ? (
                              <img 
                                src={member.avatar} 
                                alt={`${member.name}'s avatar`}
                                className={styles.memberAvatarImage}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                  if (fallback) fallback.style.display = 'flex'
                                }}
                              />
                            ) : null}
                            <div 
                              className={`${styles.memberAvatarFallback} ${member.avatar ? styles.hidden : styles.visible}`}
                            >
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className={styles.memberInfoFriendly}>
                            <div className={styles.memberNameFriendly}>{member.name}</div>
                            {member.phone && (
                              <div className={styles.memberPhoneFriendly}>📱 {member.phone}</div>
                            )}
                          </div>
                          <div className={styles.memberActionsFriendly}>
                            {isSelected && (
                              <div className={styles.checkMark}>✓</div>
                            )}
                          </div>
                        </div>

                        {/* Custom Amount Input for selected members */}
                        {isSelected && (
                          <div
                            className={styles.customAmountSection}
                            onClick={e => e.stopPropagation()}
                          >                        <span>📈 Chênh lệch:</span>

                            <label className={styles.customAmountLabel}>
                              <span className={styles.customAmountIcon}>💰</span>
                              <span className={styles.customAmountText}>Chi phí:</span>
                            </label>

                            <div className={styles.customAmountInputWrapper}>
                              <input
                                type="text"
                                value={customAmount === 0 ? "" : (customAmount / 1000).toString()}
                                onFocus={e => e.target.select()}
                                onChange={e => {
                                  const value = e.target.value.replace(/[^0-9]/g, "")
                                  handleCustomAmountChange(member.id, value === "" ? 0 : Number(value) * 1000)
                                }}
                                className={styles.customAmountInput}
                                placeholder="0"
                              />
                              <span className={styles.customAmountSuffix}>×1000 đ</span>
                            </div>
                            
                            <div className={styles.fieldTip}>
                              <span>💡 Nhập {totalAmount && selectedMembers.length > 0 ? Math.ceil(totalAmount / selectedMembers.length)/1000 : 0} = {totalAmount && selectedMembers.length > 0 ? Math.ceil(totalAmount / selectedMembers.length).toLocaleString("vi-VN") : 0}đ (chia đều)</span>
                            </div>

                            {/* Prepaid Amount Section */}
                            <div className={styles.prepaidSection}>
                              <label className={styles.customAmountLabel}>
                                <span className={styles.customAmountIcon}>💳</span>
                                <span className={styles.customAmountText}>Đã trả trước:</span>
                              </label>

                              <div className={styles.customAmountInputWrapper}>
                                <input
                                  type="text"
                                  value={memberPrepaidAmounts[member.id] === 0 ? "" : (memberPrepaidAmounts[member.id] / 1000).toString()}
                                  onFocus={e => e.target.select()}
                                  onChange={e => {
                                    const value = e.target.value.replace(/[^0-9]/g, "")
                                    handlePrepaidAmountChange(member.id, value === "" ? 0 : Number(value) * 1000)
                                  }}
                                  className={styles.customAmountInput}
                                  placeholder="0"
                                />
                                <span className={styles.customAmountSuffix}>×1000 đ</span>
                              </div>

                              {/* Amount to Pay Calculation */}
                              <div className={styles.amountCalculation}>
                                <div className={styles.calculationRow}>
                                  <span>💰 Chi phí:</span>
                                  <span>{customAmount.toLocaleString("vi-VN")}đ</span>
                                </div>
                                <div className={styles.calculationRow}>
                                  <span>💳 Đã trả:</span>
                                  <span>{(memberPrepaidAmounts[member.id] || 0).toLocaleString("vi-VN")}đ</span>
                                </div>
                                <div className={`${styles.calculationRow} ${styles.finalAmount}`}>
                                  <span>🎯 Cần trả:</span>
                                  <span className={customAmount - (memberPrepaidAmounts[member.id] || 0) <= 0 ? styles.paidText : styles.needPayText}>
                                    {(customAmount - (memberPrepaidAmounts[member.id] || 0)).toLocaleString("vi-VN")}đ
                                    {customAmount - (memberPrepaidAmounts[member.id] || 0) <= 0 && " ✅"}
                                  </span>
                                </div>
                              </div>
                            </div>
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

                {errors.participants && (
                  <div className={styles.sectionError}>
                    <span>😅 {errors.participants}</span>
                  </div>
                )}

                {errors.totalCost && (
                  <div className={styles.sectionError}>
                    <span>😅 {errors.totalCost}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit Section */}
        {members.filter((m: any) => m.isActive).length > 0 && (
          <div className={styles.submitSection}>
            <div className={styles.submitCard}>
              <div className={styles.submitSummary}>
                <h4>
                  🎯 {isEditing ? "Sẵn sàng cập nhật?" : "Sẵn sàng tạo sự kiện?"}
                </h4>
                <div className={styles.summaryDetails}>
                  <div className={styles.detailItem}>
                    <span>🎉</span>
                    <span>{title || "Chưa nhập tên sự kiện"}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span>📅</span>
                    <span>
                      {date ? new Date(date).toLocaleDateString("vi-VN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit"
                      }) : "Chưa chọn thời gian"}
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
                    <span>Tổng: {totalAmount.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || Object.keys(errors).length > 0 || selectedMembers.length === 0}
                className={`${styles.submitBtnFriendly} ${isSubmitting ? "loading" : ""} ${
                  Object.keys(errors).length > 0 || selectedMembers.length === 0 ? "disabled" : ""
                }`}
              >
                {isSubmitting ? (
                  <div className={styles.btnLoading}>
                    <div className={styles.spinnerFriendly}></div>
                    <span>{isEditing ? "Đang cập nhật..." : "Đang tạo..."}</span>
                  </div>
                ) : (
                  <div className={styles.btnContentFriendly}>
                    <span className={styles.btnEmoji}>🎯</span>
                    <span>{isEditing ? "Cập nhật sự kiện" : "Tạo sự kiện"}</span>
                    <div className={styles.btnSparkle}>✨</div>
                  </div>
                )}
              </button>

              {/* Show validation errors summary when button is disabled */}
              {(Object.keys(errors).length > 0 || selectedMembers.length === 0) && !isSubmitting && (
                <div className={styles.validationSummary}>
                  <div className={styles.validationTitle}>
                    <span>⚠️</span>
                    Vui lòng kiểm tra các lỗi sau:
                  </div>
                  <ul className={styles.validationList}>
                    {selectedMembers.length === 0 && <li>Chưa chọn thành viên tham gia</li>}
                    {Object.entries(errors).map(([field, message]) => (
                      <li key={field}>{message}</li>
                    ))}
                  </ul>
                </div>
              )}

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

export default PersonalEventForm