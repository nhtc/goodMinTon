"use client"
import React from 'react'
import styles from '../app/payment/page.module.css'

interface QRCodeDisplayProps {
  qrCodeUrl: string
  isLoading: boolean
  hasValidPayment: boolean
  paymentType: 'games' | 'personal-events'
  onOpenBankingApp: () => void
  children?: React.ReactNode
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  qrCodeUrl,
  isLoading,
  hasValidPayment,
  paymentType,
  onOpenBankingApp,
  children
}) => {
  const renderPlaceholder = () => {
    if (isLoading) {
      return (
        <div className={styles.qrCalculatingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Đang tạo mã QR...</p>
        </div>
      )
    }

    if (!hasValidPayment) {
      return (
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
    }

    return (
      <div className={styles.noMemberSelected}>
        <span className={styles.selectIcon}>👆</span>
        <p>Vui lòng kiểm tra lại thông tin thanh toán</p>
      </div>
    )
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
              onError={(e) => {
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