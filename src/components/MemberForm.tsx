"use client"
import React, { useState, useEffect, useRef } from "react"

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
    <div className='member-form-container'>
      {/* Form Header */}
      <div className='form-header'>
        <div className='header-icon-wrapper'>
          <div className='header-icon'>
            <span>👤</span>
          </div>
          <div className='icon-pulse'></div>
        </div>
        <div className='header-content'>
          <h2 className='form-title'>Thêm Thành viên Mới</h2>
          <p className='form-subtitle'>
            Mời thêm thành viên mới vào câu lạc bộ cầu lông của bạn
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className='alert success-alert'>
          <div className='alert-icon'>✅</div>
          <div className='alert-content'>
            <div className='alert-title'>Thành công!</div>
            <div className='alert-message'>{success}</div>
          </div>
          <div className='alert-progress'></div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className='alert error-alert'>
          <div className='alert-icon'>⚠️</div>
          <div className='alert-content'>
            <div className='alert-title'>Có lỗi xảy ra</div>
            <div className='alert-message'>{error}</div>
          </div>
          <button onClick={() => setError("")} className='alert-close'>
            ✕
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className='member-form'>
        <div className='form-fields'>
          {/* Name Field */}
          <div className='field-group'>
            <label htmlFor='name' className='field-label'>
              <span className='label-icon'>👤</span>
              <span className='label-text'>Tên đầy đủ</span>
              <span className='required-star'>*</span>
            </label>
            <div className='input-wrapper'>
              <input
                type='text'
                id='name'
                value={name}
                onChange={handleNameChange}
                required
                className={`form-input ${
                  error && !name.trim() ? "error" : ""
                } ${nameExists ? "error" : ""} ${
                  name.trim() && !nameExists && !isCheckingName ? "filled" : ""
                }`}
                placeholder='Nhập tên thành viên (phải duy nhất)...'
                disabled={isSubmitting}
                maxLength={50}
              />
              <div className='input-border'></div>

              {/* Input status icons */}
              {isCheckingName && (
                <div className='input-icon checking'>
                  <div className='mini-spinner'></div>
                </div>
              )}

              {!isCheckingName && nameExists && (
                <div className='input-icon error'>
                  <span>✕</span>
                </div>
              )}

              {!isCheckingName && name.trim().length >= 2 && !nameExists && (
                <div className='input-icon success'>
                  <span>✓</span>
                </div>
              )}
            </div>

            {/* Field help messages */}
            {nameExists && !isCheckingName && (
              <div className='field-help error'>
                <span>❌ Tên này đã được sử dụng</span>
              </div>
            )}

            {name.trim().length >= 2 && !nameExists && !isCheckingName && (
              <div className='field-help success'>
                <span>✓ Tên khả dụng</span>
              </div>
            )}

            {isCheckingName && (
              <div className='field-help checking'>
                <span>🔍 Đang kiểm tra tên...</span>
              </div>
            )}

            {name.trim().length > 0 && name.trim().length < 2 && (
              <div className='field-help warning'>
                <span>⚠️ Tên phải có ít nhất 2 ký tự</span>
              </div>
            )}
          </div>

          {/* Phone Field */}
          <div className='field-group'>
            <label htmlFor='phone' className='field-label'>
              <span className='label-icon'>📱</span>
              <span className='label-text'>Số điện thoại</span>
              <span className='optional-text'>(không bắt buộc)</span>
            </label>
            <div className='input-wrapper'>
              <input
                type='tel'
                id='phone'
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className={`form-input ${phone.trim() ? "filled" : ""}`}
                placeholder='Nhập số điện thoại...'
                disabled={isSubmitting}
                maxLength={15}
              />
              <div className='input-border'></div>
              {phone.trim() && (
                <div className='input-icon success'>
                  <span>✓</span>
                </div>
              )}
            </div>
            <div className='field-help'>
              <span>💡 Số điện thoại giúp liên lạc dễ dàng hơn</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className='form-actions'>
          <button
            type='submit'
            disabled={
              isSubmitting ||
              !name.trim() ||
              name.trim().length < 2 ||
              nameExists ||
              isCheckingName
            }
            className={`submit-btn ${isSubmitting ? "loading" : ""} ${
              !name.trim() ||
              name.trim().length < 2 ||
              nameExists ||
              isCheckingName
                ? "disabled"
                : ""
            }`}
          >
            <span className='btn-content'>
              {isSubmitting ? (
                <>
                  <div className='btn-spinner'></div>
                  <span>Đang thêm thành viên...</span>
                </>
              ) : (
                <>
                  <span className='btn-icon'>➕</span>
                  <span>Thêm thành viên</span>
                </>
              )}
            </span>
            <div className='btn-shine'></div>
          </button>

          {/* Form Tips */}
          <div className='form-tips'>
            <div className='tip-item'>
              <span className='tip-icon'>⚠️</span>
              <span>Tên phải duy nhất trong hệ thống</span>
            </div>
            <div className='tip-item'>
              <span className='tip-icon'>🔍</span>
              <span>Hệ thống sẽ kiểm tra tên tự động</span>
            </div>
            <div className='tip-item'>
              <span className='tip-icon'>🔒</span>
              <span>Thông tin của bạn được bảo mật tuyệt đối</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default MemberForm
