"use client"
import React, { useEffect, useRef } from "react"
import Link from "next/link"

const HomePage = () => {
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // Intersection Observer for smooth scroll animations
    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate")
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    )

    // Observe all elements with animate-on-scroll class
    const elements = document.querySelectorAll(".animate-on-scroll")
    elements.forEach(el => observerRef.current?.observe(el))

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return (
    <div className='min-h-screen home-gradient smooth-scroll'>
      {/* Hero Section */}
      <div className='hero-section'>
        <div className='container mx-auto px-6 py-20'>
          <div className='text-center text-white mb-20 animate-on-scroll'>
            <h1 className='hero-title'>
              Tính tiền
              <span className='hero-highlight'> Cầu Lông</span>
            </h1>
          </div>

          {/* Feature Cards */}
          <div className='features-grid'>
            <div className='feature-card primary-card animate-on-scroll'>
              <div className='feature-icon primary-icon'>
                <span>👥</span>
              </div>
              <div className='feature-content'>
                <h3 className='feature-title'>Quản lý Thành viên</h3>
                <p className='feature-description'>
                  Thêm, xóa và tổ chức tất cả thành viên trong câu lạc bộ cầu
                  lông của bạn. Theo dõi thông tin liên lạc và lịch sử tham gia.
                </p>
                <div className='feature-benefits'>
                  <span className='benefit-tag'>✓ Thêm nhanh</span>
                  <span className='benefit-tag'>✓ Tìm kiếm dễ</span>
                  <span className='benefit-tag'>✓ Thông tin đầy đủ</span>
                </div>
              </div>
              <Link href='/members' className='feature-button btn-primary'>
                <span>Quản lý Thành viên</span>
                <span className='button-arrow'>→</span>
              </Link>
            </div>

            <div className='feature-card secondary-card animate-on-scroll'>
              <div className='feature-icon secondary-icon'>
                <span>📅</span>
              </div>
              <div className='feature-content'>
                <h3 className='feature-title'>Lịch sử Trận đấu</h3>
                <p className='feature-description'>
                  Theo dõi tất cả các trận đấu, chi phí và hồ sơ người tham gia.
                  Nhận thông tin chi tiết với phân tích và báo cáo chi phí.
                </p>
                <div className='feature-benefits'>
                  <span className='benefit-tag'>✓ Theo dõi chi phí</span>
                  <span className='benefit-tag'>✓ Phân tích</span>
                  <span className='benefit-tag'>✓ Báo cáo</span>
                </div>
              </div>
              <Link href='/history' className='feature-button btn-secondary'>
                <span>Xem Lịch sử</span>
                <span className='button-arrow'>→</span>
              </Link>
            </div>

            <div className='feature-card accent-card animate-on-scroll'>
              <div className='feature-icon accent-icon'>
                <span>⚡</span>
              </div>
              <div className='feature-content'>
                <h3 className='feature-title'>Thao tác Nhanh</h3>
                <p className='feature-description'>
                  Trực tiếp ghi lại trận đấu mới hoặc thêm thành viên. Mọi thứ
                  bạn cần chỉ cách một cú nhấp chuột.
                </p>
                <div className='feature-benefits'>
                  <span className='benefit-tag'>✓ Nhập nhanh</span>
                  <span className='benefit-tag'>✓ Form thông minh</span>
                  <span className='benefit-tag'>✓ Tự động tính</span>
                </div>
              </div>
              <div className='quick-actions'>
                <Link href='/history' className='quick-action-btn'>
                  <span>🏸</span>
                  <span>Trận mới</span>
                </Link>
                <Link href='/members' className='quick-action-btn'>
                  <span>👤</span>
                  <span>Thêm người</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Call to Action Section */}
          <div className='cta-section animate-on-scroll'>
            <div className='cta-content'>
              <h2 className='cta-title'>Sẵn sàng Bắt đầu?</h2>
              <p className='cta-description'>
                Tham gia cùng hàng nghìn câu lạc bộ cầu lông đã sử dụng nền tảng
                của chúng tôi để quản lý các hoạt động của họ.
              </p>
              <div className='cta-buttons'>
                <Link href='/members' className='cta-button primary'>
                  <span>🚀</span>
                  <span>Bắt đầu Quản lý</span>
                </Link>
                <Link href='/history' className='cta-button secondary'>
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
