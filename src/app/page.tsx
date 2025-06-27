"use client"
import React, { useEffect, useRef } from "react"
import Link from "next/link"
import styles from "./page.module.css"

const HomePage = () => {
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // Intersection Observer for smooth scroll animations
    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.animate)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      }
    )

    // Observe all elements with animate-on-scroll class
    const elements = document.querySelectorAll(`.${styles.animateOnScroll}`)
    elements.forEach(el => observerRef.current?.observe(el))

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return (
    <div className={`min-h-screen ${styles.homeGradient} smooth-scroll`}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className='container mx-auto px-6 py-20'>
          <div
            className={`text-center text-white mb-20 ${styles.animateOnScroll}`}
          >
            <h1 className={styles.heroTitle}>
              Tính tiền
              <span className={styles.heroHighlight}> Cầu Lông</span>
            </h1>
          </div>

          {/* Feature Cards */}
          <div className={styles.featuresGrid}>
            <div
              className={`${styles.featureCard} ${styles.primaryCard} ${styles.animateOnScroll}`}
            >
              <div className={`${styles.featureIcon} ${styles.primaryIcon}`}>
                <span>👥</span>
              </div>
              <div className={styles.featureContent}>
                <h3 className={styles.featureTitle}>Quản lý Thành viên</h3>
                <p className={styles.featureDescription}>
                  Thêm, xóa và tổ chức tất cả thành viên trong câu lạc bộ cầu
                  lông của bạn. Theo dõi thông tin liên lạc và lịch sử tham gia.
                </p>
                <div className={styles.featureBenefits}>
                  <span className={styles.benefitTag}>✓ Thêm nhanh</span>
                  <span className={styles.benefitTag}>✓ Tìm kiếm dễ</span>
                  <span className={styles.benefitTag}>✓ Thông tin đầy đủ</span>
                </div>
              </div>
              <Link
                href='/members'
                className={`${styles.featureButton} ${styles.btnPrimary}`}
              >
                <span>Quản lý Thành viên</span>
                <span className={styles.buttonArrow}>→</span>
              </Link>
            </div>

            <div
              className={`${styles.featureCard} ${styles.secondaryCard} ${styles.animateOnScroll}`}
            >
              <div className={`${styles.featureIcon} ${styles.secondaryIcon}`}>
                <span>📅</span>
              </div>
              <div className={styles.featureContent}>
                <h3 className={styles.featureTitle}>Lịch sử Trận đấu</h3>
                <p className={styles.featureDescription}>
                  Theo dõi tất cả các trận đấu, chi phí và hồ sơ người tham gia.
                  Nhận thông tin chi tiết với phân tích và báo cáo chi phí.
                </p>
                <div className={styles.featureBenefits}>
                  <span className={styles.benefitTag}>✓ Theo dõi chi phí</span>
                  <span className={styles.benefitTag}>✓ Phân tích</span>
                  <span className={styles.benefitTag}>✓ Báo cáo</span>
                </div>
              </div>
              <Link
                href='/history'
                className={`${styles.featureButton} ${styles.btnSecondary}`}
              >
                <span>Xem Lịch sử</span>
                <span className={styles.buttonArrow}>→</span>
              </Link>
            </div>

            <div
              className={`${styles.featureCard} ${styles.accentCard} ${styles.animateOnScroll}`}
            >
              <div className={`${styles.featureIcon} ${styles.accentIcon}`}>
                <span>⚡</span>
              </div>
              <div className={styles.featureContent}>
                <h3 className={styles.featureTitle}>Thao tác Nhanh</h3>
                <p className={styles.featureDescription}>
                  Trực tiếp ghi lại trận đấu mới hoặc thêm thành viên. Mọi thứ
                  bạn cần chỉ cách một cú nhấp chuột.
                </p>
                <div className={styles.featureBenefits}>
                  <span className={styles.benefitTag}>✓ Nhập nhanh</span>
                  <span className={styles.benefitTag}>✓ Form thông minh</span>
                  <span className={styles.benefitTag}>✓ Tự động tính</span>
                </div>
              </div>
              <div className={styles.quickActions}>
                <Link href='/history' className={styles.quickActionBtn}>
                  <span>🏸</span>
                  <span>Trận mới</span>
                </Link>
                <Link href='/members' className={styles.quickActionBtn}>
                  <span>👤</span>
                  <span>Thêm người</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Call to Action Section */}
          <div className={`${styles.ctaSection} ${styles.animateOnScroll}`}>
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>Sẵn sàng Bắt đầu?</h2>
              <p className={styles.ctaDescription}>
                Tham gia cùng hàng nghìn câu lạc bộ cầu lông đã sử dụng nền tảng
                của chúng tôi để quản lý các hoạt động của họ.
              </p>
              <div className={styles.ctaButtons}>
                <Link
                  href='/members'
                  className={`${styles.ctaButton} ${styles.primary}`}
                >
                  <span>🚀</span>
                  <span>Bắt đầu Quản lý</span>
                </Link>
                <Link
                  href='/history'
                  className={`${styles.ctaButton} ${styles.secondary}`}
                >
                  <span>📊</span>
                  <span>Xem Demo</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
