"use client"
import React from 'react'
import styles from '../app/payment/page.module.css'

/**
 * Props for QRCodeDisplay component
 */
interface QRCodeDisplayProps {
  /** URL of the QR code image to display */
  qrCodeUrl: string
  /** Whether the QR code is currently being generated */
  isLoading: boolean
  /** Whether the payment information is valid and complete */
  hasValidPayment: boolean
  /** Type of payment being made */
  paymentType: 'games' | 'personal-events'
  /** Callback function to open banking app */
  onOpenBankingApp: () => void
  /** Additional content to render below the QR code */
  children?: React.ReactNode
}

/**
 * QRCodeDisplay component renders a QR code for payment processing
 * with appropriate placeholders and error handling
 * 
 * @param props - Component props
 * @returns JSX element containing QR code display interface
 */
const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  qrCodeUrl,
  isLoading,
  hasValidPayment,
  paymentType,
  onOpenBankingApp,
  children
}) => {
  /**
   * Renders loading state placeholder
   */
  const renderLoadingPlaceholder = () => (
    <div className={styles.qrCalculatingState}>
      <div className={styles.loadingSpinner}></div>
      <p>Đang tạo mã QR...</p>
    </div>
  )

  /**
   * Renders invalid payment state placeholder
   */
  const renderInvalidPaymentPlaceholder = () => (
    <div className={styles.noMemberSelected}>
      <span className={styles.selectIcon}>👆</span>
      <p>
        {paymentType === 'games' 
          ? "Vui lòng chọn thành viên để tạo mã QR thanh toán"
          : "Vui lòng chọn sự kiện và thành viên để tạo mã QR thanh toán"
        }
      </p>
    </div>
  )

  /**
   * Renders default error state placeholder
   */
  const renderErrorPlaceholder = () => (
    <div className={styles.noMemberSelected}>
      <span className={styles.selectIcon}>👆</span>
      <p>Vui lòng kiểm tra lại thông tin thanh toán</p>
    </div>
  )

  /**
   * Renders appropriate placeholder based on current state
   */
  const renderPlaceholder = () => {
    if (isLoading) {
      return renderLoadingPlaceholder()
    }

    if (!hasValidPayment) {
      return renderInvalidPaymentPlaceholder()
    }

    return renderErrorPlaceholder()
  }

  /**
   * Handles QR code image load error with user-friendly fallback
   */
  const handleQRImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error("QR Code failed to load:", qrCodeUrl)
    const target = e.currentTarget
    target.style.display = "none"
    
    // Add error message to parent container
    const errorDiv = document.createElement('div')
    errorDiv.className = styles.qrError || styles.noMemberSelected
    errorDiv.innerHTML = '<p>Không thể tải mã QR. Vui lòng thử lại.</p>'
    target.parentNode?.appendChild(errorDiv)
  }

  return (
    <div className={styles.qrSection}>
      <div className={styles.qrContainer}>
        <div className={styles.qrWrapper}>
          {!hasValidPayment || isLoading ? (
            <div className={styles.qrPlaceholder}>
              {renderPlaceholder()}
            </div>
          ) : qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt='QR Code thanh toán'
              className={styles.qrImage}
              onError={handleQRImageError}
            />
          ) : (
            <div className={styles.qrPlaceholder}>
              {renderLoadingPlaceholder()}
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

        {/* Banking App Button */}
        {hasValidPayment && !isLoading && (
          <div className={styles.bankingAppSection}>
            <div className={styles.orDivider}>
              <span className={styles.orText}>hoặc</span>
            </div>
            <button
              onClick={onOpenBankingApp}
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

        {/* Additional content (instructions, etc.) */}
        {children}

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
  )
}

export default QRCodeDisplay