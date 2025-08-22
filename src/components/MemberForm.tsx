"use client"
import { withAuth } from "@/components/AuthorizedComponent"
import React, { useState, useEffect, useRef } from "react"
import styles from "./MemberForm.module.css"

interface Member {
  id: string
  name: string
  email?: string
  phone?: string
  isActive: boolean
  createdAt: string
}

interface MemberFormProps {
  onUpdate: (updatedMember?: Member) => void
  editingMember?: Member | null
}

const MemberForm: React.FC<MemberFormProps> = ({ onUpdate, editingMember }) => {
  const [name, setName] = useState(editingMember?.name || "")
  const [phone, setPhone] = useState(editingMember?.phone || "")
  const [isActive, setIsActive] = useState(editingMember?.isActive ?? true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingName, setIsCheckingName] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [nameExists, setNameExists] = useState(false)
  const [phoneError, setPhoneError] = useState("")
  const isEditing = !!editingMember

  // Use useRef to store the timeout ID
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Vietnamese phone number validation
  const validateVietnamesePhone = (
    phoneNumber: string
  ): { isValid: boolean; message: string } => {
    if (!phoneNumber.trim()) {
      return { isValid: true, message: "" } // Phone is optional
    }

    // Remove all non-digit characters
    const cleanPhone = phoneNumber.replace(/\D/g, "")

    // Vietnamese phone number patterns
    const patterns = [
      /^(84|0)(3[2-9]|5[689]|7[06-9]|8[1-9]|9[0-9])\d{7}$/, // Mobile numbers
      /^(84|0)(2[0-9])\d{8}$/, // Landline numbers (area code 2X)
      /^(84|0)(2[0-9])\d{7}$/, // Some landline numbers (shorter)
    ]

    const isValid = patterns.some(pattern => pattern.test(cleanPhone))

    if (!isValid) {
      if (cleanPhone.length < 9) {
        return { isValid: false, message: "Số điện thoại quá ngắn" }
      } else if (cleanPhone.length > 11) {
        return { isValid: false, message: "Số điện thoại quá dài" }
      } else if (!cleanPhone.startsWith("84") && !cleanPhone.startsWith("0")) {
        return {
          isValid: false,
          message: "Số điện thoại phải bắt đầu bằng 0 hoặc 84",
        }
      } else {
        return { isValid: false, message: "Số điện thoại không hợp lệ" }
      }
    }

    return { isValid: true, message: "Số điện thoại hợp lệ" }
  }

  // Populate form when editing
  useEffect(() => {
    if (editingMember) {
      setName(editingMember.name)
      setPhone(editingMember.phone || "")
      setIsActive(editingMember.isActive ?? true)
      setError("")
      setSuccess("")
      setNameExists(false)
      setPhoneError("")
    }
  }, [editingMember])

  // Handle phone number changes with validation
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPhone(value)

    // Clear general error when user starts typing
    if (error && error.includes("điện thoại")) {
      setError("")
    }

    // Validate phone number
    const validation = validateVietnamesePhone(value)
    setPhoneError(validation.isValid ? "" : validation.message)
  }

  // Check if name exists as user types
  const checkNameExists = async (nameValue: string) => {
    if (nameValue.trim().length < 2) return
    setIsCheckingName(true)
    try {
      const response = await fetch(
        `/api/members/check-name?name=${encodeURIComponent(nameValue.trim())}`
      )
      const data = await response.json()
      setNameExists(data.exists)
    } catch (error) {
      console.error("Error checking name:", error)
    } finally {
      setIsCheckingName(false)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setName(value)
    setNameExists(false)

    // Clear error when user starts typing
    if (error && value.trim()) {
      setError("")
    }

    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Set new timeout for debounced name checking
    if (value.trim().length >= 2) {
      setIsCheckingName?.(true)
      debounceTimeoutRef.current = setTimeout(() => {
        checkNameExists(value)
      }, 800) // 800ms delay
    } else {
      // If name is too short, reset states
      setIsCheckingName(false)
      setNameExists(false)
    }
  }

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    // Clear any pending name check
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Basic validation
    if (!name.trim()) {
      setError("Tên thành viên là bắt buộc")
      setIsSubmitting(false)
      return
    }

    if (name.trim().length < 2) {
      setError("Tên phải có ít nhất 2 ký tự")
      setIsSubmitting(false)
      return
    }

    // Final check for name existence before submitting (skip for editing with same name)
    if (isCheckingName) {
      setError("Vui lòng đợi kiểm tra tên hoàn tất")
      setIsSubmitting(false)
      return
    }

    if (nameExists && (!isEditing || name.trim() !== editingMember?.name)) {
      setError("Tên này đã được sử dụng. Vui lòng chọn tên khác.")
      setIsSubmitting(false)
      return
    }

    // Validate phone number if provided
    if (phone.trim()) {
      const phoneValidation = validateVietnamesePhone(phone.trim())
      if (!phoneValidation.isValid) {
        setError(`Số điện thoại không hợp lệ: ${phoneValidation.message}`)
        setIsSubmitting(false)
        return
      }
    }

    try {
      const url = isEditing
        ? `/api/members/${editingMember!.id}`
        : "/api/members"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || undefined,
          isActive,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || `Failed to ${isEditing ? "update" : "create"} member`
        )
      }

      // Success
      if (!isEditing) {
        setName("")
        setPhone("")
        setIsActive(true)
        setNameExists(false)
      }
      setSuccess(
        isEditing
          ? "🎉 Cập nhật thành viên thành công!"
          : "🎉 Thêm thành viên thành công!"
      )
      
      // Pass the updated/created member data back to parent
      onUpdate(data)

      setTimeout(() => setSuccess(""), 4000)
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "creating"} member:`,
        error
      )
      setError(
        error instanceof Error
          ? error.message
          : `Không thể ${
              isEditing ? "cập nhật" : "thêm"
            } thành viên. Vui lòng thử lại!`
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.memberFormContainer}>
      {/* Form Header */}
      <div className={styles.formHeader}>
        <div className={styles.headerIconWrapper}>
          <div className={styles.headerIcon}>
            <span>👤</span>
          </div>
          <div className={styles.iconPulse}></div>
        </div>
        <div className={styles.headerContent}>
          <h2 className={styles.formTitle}>
            {isEditing ? "Chỉnh Sửa Thành Viên" : "Thêm Thành viên Mới"}
          </h2>
          <p className={styles.formSubtitle}>
            {isEditing
              ? "Cập nhật thông tin thành viên câu lạc bộ cầu lông"
              : "Mời thêm thành viên mới vào câu lạc bộ cầu lông của bạn"}
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className={`${styles.alert} ${styles.successAlert}`}>
          <div className={styles.alertIcon}>✅</div>
          <div className={styles.alertContent}>
            <div className={styles.alertTitle}>Thành công!</div>
            <div className={styles.alertMessage}>{success}</div>
          </div>
          <div className={styles.alertProgress}></div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className={`${styles.alert} ${styles.errorAlert}`}>
          <div className={styles.alertIcon}>⚠️</div>
          <div className={styles.alertContent}>
            <div className={styles.alertTitle}>Có lỗi xảy ra</div>
            <div className={styles.alertMessage}>{error}</div>
          </div>
          <button onClick={() => setError("")} className={styles.alertClose}>
            ✕
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className={styles.memberForm}>
        <div className={styles.formFields}>
          {/* Name Field */}
          <div className={styles.fieldGroup}>
            <label htmlFor='name' className={styles.fieldLabel}>
              <span className={styles.labelIcon}>👤</span>
              <span className={styles.labelText}>Tên đầy đủ</span>
              <span className={styles.requiredStar}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <input
                type='text'
                id='name'
                value={name}
                onChange={handleNameChange}
                required
                className={`${styles.formInput} ${
                  error && !name.trim() ? styles.error : ""
                } ${nameExists ? styles.error : ""} ${
                  name.trim() && !nameExists && !isCheckingName
                    ? styles.filled
                    : ""
                }`}
                placeholder='Nhập tên thành viên (phải duy nhất)...'
                disabled={isSubmitting}
                maxLength={50}
              />
              <div className={styles.inputBorder}></div>

              {/* Input status icons */}
              {isCheckingName && (
                <div className={`${styles.inputIcon} ${styles.checking}`}>
                  <div className={styles.miniSpinner}></div>
                </div>
              )}

              {!isCheckingName && nameExists && (
                <div className={`${styles.inputIcon} ${styles.error}`}>
                  <span>✕</span>
                </div>
              )}

              {!isCheckingName && name.trim().length >= 2 && !nameExists && (
                <div className={`${styles.inputIcon} ${styles.success}`}>
                  <span>✓</span>
                </div>
              )}
            </div>

            {/* Field help messages */}
            {nameExists && !isCheckingName && (
              <div className={`${styles.fieldHelp} ${styles.error}`}>
                <span>❌ Tên này đã được sử dụng</span>
              </div>
            )}

            {name.trim().length >= 2 && !nameExists && !isCheckingName && (
              <div className={`${styles.fieldHelp} ${styles.success}`}>
                <span>✓ Tên khả dụng</span>
              </div>
            )}

            {isCheckingName && (
              <div className={`${styles.fieldHelp} ${styles.checking}`}>
                <span>🔍 Đang kiểm tra tên...</span>
              </div>
            )}

            {name.trim().length > 0 && name.trim().length < 2 && (
              <div className={`${styles.fieldHelp} ${styles.warning}`}>
                <span>⚠️ Tên phải có ít nhất 2 ký tự</span>
              </div>
            )}
          </div>

          {/* Phone Field */}
          <div className={styles.fieldGroup}>
            <label htmlFor='phone' className={styles.fieldLabel}>
              <span className={styles.labelIcon}>📱</span>
              <span className={styles.labelText}>Số điện thoại</span>
              <span className={styles.optionalText}>(không bắt buộc)</span>
            </label>
            <div className={styles.inputWrapper}>
              <input
                type='tel'
                id='phone'
                value={phone}
                onChange={handlePhoneChange}
                className={`${styles.formInput} ${
                  phoneError ? styles.error : ""
                } ${phone.trim() && !phoneError ? styles.filled : ""}`}
                placeholder='VD: 0912345678 hoặc 84912345678'
                disabled={isSubmitting}
                maxLength={15}
              />
              <div className={styles.inputBorder}></div>

              {/* Phone validation icons */}
              {phoneError && (
                <div className={`${styles.inputIcon} ${styles.error}`}>
                  <span>✕</span>
                </div>
              )}

              {phone.trim() && !phoneError && (
                <div className={`${styles.inputIcon} ${styles.success}`}>
                  <span>✓</span>
                </div>
              )}
            </div>

            {/* Phone validation messages */}
            {phoneError && (
              <div className={`${styles.fieldHelp} ${styles.error}`}>
                <span>❌ {phoneError}</span>
              </div>
            )}

            {phone.trim() && !phoneError && (
              <div className={`${styles.fieldHelp} ${styles.success}`}>
                <span>✓ Số điện thoại hợp lệ</span>
              </div>
            )}

            {!phone.trim() && (
              <div className={styles.fieldHelp}>
                <span>💡 VD: 0912345678, +84912345678, 02812345678</span>
              </div>
            )}
          </div>

          {/* Active Status Field */}
          <div className={styles.fieldGroup}>
            <label className={`${styles.fieldLabel} ${styles.friendly}`}>
              <span className={styles.labelIcon}>
                {isActive ? "✅" : "⏸️"}
              </span>
              <span className={styles.labelText}>Trạng thái thành viên</span>
            </label>
            <div className={styles.statusToggleWrapper}>
              <label className={styles.statusToggle}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className={styles.statusCheckbox}
                  disabled={isSubmitting}
                />
                <span className={styles.statusSlider}></span>
                <span className={styles.statusLabel}>
                  {isActive ? "Đang hoạt động" : "Tạm dừng"}
                </span>
              </label>
            </div>
            <div className={styles.fieldHelp}>
              <span>
                💡 {isActive 
                  ? "Thành viên sẽ xuất hiện trong danh sách chọn khi tạo trận đấu"
                  : "Thành viên sẽ không xuất hiện khi tạo trận đấu mới"
                }
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className={styles.formActions}>
          <button
            type='submit'
            disabled={
              isSubmitting ||
              !name.trim() ||
              name.trim().length < 2 ||
              nameExists ||
              isCheckingName ||
              phoneError !== ""
            }
            className={`${styles.submitBtn} ${
              isSubmitting ? styles.loading : ""
            } ${
              !name.trim() ||
              name.trim().length < 2 ||
              nameExists ||
              isCheckingName ||
              phoneError !== ""
                ? styles.disabled
                : ""
            }`}
          >
            <span className={styles.btnContent}>
              {isSubmitting ? (
                <>
                  <div className={styles.btnSpinner}></div>
                  <span>
                    {isEditing ? "Đang cập nhật..." : "Đang thêm thành viên..."}
                  </span>
                </>
              ) : (
                <>
                  <span className={styles.btnIcon}>
                    {isEditing ? "✏️" : "➕"}
                  </span>
                  <span>
                    {isEditing ? "Cập nhật thành viên" : "Thêm thành viên"}
                  </span>
                </>
              )}
            </span>
            <div className={styles.btnShine}></div>
          </button>

          {/* Form Tips */}
          <div className={styles.formTips}>
            <div className={styles.tipItem}>
              <span className={styles.tipIcon}>⚠️</span>
              <span>Tên phải duy nhất trong hệ thống</span>
            </div>
            <div className={styles.tipItem}>
              <span className={styles.tipIcon}>🔍</span>
              <span>Hệ thống sẽ kiểm tra tên tự động</span>
            </div>
            <div className={styles.tipItem}>
              <span className={styles.tipIcon}>�</span>
              <span>Số điện thoại hỗ trợ định dạng Việt Nam</span>
            </div>
            <div className={styles.tipItem}>
              <span className={styles.tipIcon}>�🔒</span>
              <span>Thông tin của bạn được bảo mật tuyệt đối</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default withAuth(MemberForm)
