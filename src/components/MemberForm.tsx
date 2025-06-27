"use client"
import { withAuth } from "@/components/AuthorizedComponent"
import React, { useState, useEffect, useRef } from "react"
import styles from "./MemberForm.module.css"

interface MemberFormProps {
  onUpdate: () => void
}

const MemberForm: React.FC<MemberFormProps> = ({ onUpdate }) => {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingName, setIsCheckingName] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [nameExists, setNameExists] = useState(false)

  // Use useRef to store the timeout ID
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

    // Final check for name existence before submitting
    if (isCheckingName) {
      setError("Vui lòng đợi kiểm tra tên hoàn tất")
      setIsSubmitting(false)
      return
    }

    if (nameExists) {
      setError("Tên này đã được sử dụng. Vui lòng chọn tên khác.")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create member")
      }

      // Success
      setName("")
      setPhone("")
      setNameExists(false)
      setSuccess("🎉 Thêm thành viên thành công!")
      onUpdate()

      setTimeout(() => setSuccess(""), 4000)
    } catch (error) {
      console.error("Error creating member:", error)
      setError(
        error instanceof Error
          ? error.message
          : "Không thể thêm thành viên. Vui lòng thử lại!"
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
          <h2 className={styles.formTitle}>Thêm Thành viên Mới</h2>
          <p className={styles.formSubtitle}>
            Mời thêm thành viên mới vào câu lạc bộ cầu lông của bạn
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
                onChange={e => setPhone(e.target.value)}
                className={`${styles.formInput} ${
                  phone.trim() ? styles.filled : ""
                }`}
                placeholder='Nhập số điện thoại...'
                disabled={isSubmitting}
                maxLength={15}
              />
              <div className={styles.inputBorder}></div>
              {phone.trim() && (
                <div className={`${styles.inputIcon} ${styles.success}`}>
                  <span>✓</span>
                </div>
              )}
            </div>
            <div className={styles.fieldHelp}>
              <span>💡 Số điện thoại giúp liên lạc dễ dàng hơn</span>
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
              isCheckingName
            }
            className={`${styles.submitBtn} ${
              isSubmitting ? styles.loading : ""
            } ${
              !name.trim() ||
              name.trim().length < 2 ||
              nameExists ||
              isCheckingName
                ? styles.disabled
                : ""
            }`}
          >
            <span className={styles.btnContent}>
              {isSubmitting ? (
                <>
                  <div className={styles.btnSpinner}></div>
                  <span>Đang thêm thành viên...</span>
                </>
              ) : (
                <>
                  <span className={styles.btnIcon}>➕</span>
                  <span>Thêm thành viên</span>
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
              <span className={styles.tipIcon}>🔒</span>
              <span>Thông tin của bạn được bảo mật tuyệt đối</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default withAuth(MemberForm)
