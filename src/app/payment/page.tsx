"use client"
import React, { Suspense } from "react"
import styles from "./page.module.css"
import PaymentPageContent from "@/app/payment/PaymentPageContent"

// Loading component for Suspense fallback
const PaymentPageLoading = () => {
  return (
    <div className={styles.paymentPage}>
      <div className={styles.backgroundPattern}>
        <div className={styles.bgCircle1}></div>
        <div className={styles.bgCircle2}></div>
      </div>

      <div className={styles.container}>
        <div className={styles.paymentCard}>
          <div className={styles.header}>
            <div className={styles.iconContainer}>
              <span className={styles.icon} title='Payment QR Code'>
                💳
              </span>
            </div>
            <h1 className={styles.title}>Thanh Toán QR</h1>
            <p className={styles.subtitle}>Đang tải trang thanh toán...</p>
          </div>

          <div className={styles.loadingContent}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>Vui lòng đợi một chút...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const PaymentPage = () => {
  return (
    <Suspense fallback={<PaymentPageLoading />}>
      <PaymentPageContent />
    </Suspense>
  )
}

export default PaymentPage
