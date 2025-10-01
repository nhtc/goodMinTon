"use client"
import React, { useEffect, useRef } from "react"
import Link from "next/link"
import { TypeAnimation } from "react-type-animation"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import CountUp from "react-countup"
import NotificationDemo from "../components/NotificationDemo"
import { Container, Section } from "../components/Layout"
import { StatCard, InfoCard } from "../components/Card"
import styles from "./page.module.css"

const HomePage = () => {
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Sample data for charts
  const monthlyData = [
    { name: "T1", games: 24, members: 45 },
    { name: "T2", games: 32, members: 52 },
    { name: "T3", games: 28, members: 48 },
    { name: "T4", games: 35, members: 58 },
    { name: "T5", games: 42, members: 65 },
    { name: "T6", games: 38, members: 62 },
  ]

  const costData = [
    { name: "Sân cầu", value: 65, color: "#4ade80" },
    { name: "Cầu lông", value: 25, color: "#60a5fa" },
    { name: "Khác", value: 10, color: "#f59e0b" },
  ]

  const COLORS = ["#4ade80", "#60a5fa", "#f59e0b"]

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
      <Container>
        {/* Hero Section */}
        <Section className={styles.heroSection}>
          <div className={`text-center mb-20 ${styles.animateOnScroll}`}>
            <h1 className={`${styles.heroTitle} ${styles.colorfulText}`}>
              <TypeAnimation
                sequence={[
                  "Tính tiền Cầu Lông", // Type this text
                  2000, // Wait 2 seconds
                  "Quản lý Club dễ dàng", // Type this text
                  2000, // Wait 2 seconds
                  "Tính tiền Cầu Lông", // Back to main text
                ]}
                wrapper='span'
                cursor={true}
                repeat={Infinity}
                style={{
                  fontSize: "inherit",
                  fontWeight: "inherit",
                  background: "inherit",
                  WebkitBackgroundClip: "inherit",
                  WebkitTextFillColor: "inherit",
                  backgroundClip: "inherit",
                  display: "inline-block",
                }}
              />
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mt-6">
              Hệ thống quản lý câu lạc bộ cầu lông hiện đại, giúp bạn dễ dàng tính toán chi phí, 
              theo dõi thành viên và tạo QR code thanh toán tự động.
            </p>
          </div>

          {/* Statistics Section */}
          <Section className={`${styles.statsSection} ${styles.animateOnScroll}`}>
            <div className={styles.statsGrid}>
              <StatCard
                title="Trận đấu hoàn thành"
                value="247"
                icon="🏸"
                color="primary"
              />
              <StatCard
                title="Thành viên tích cực"
                value="89"
                icon="👥"
                color="success"
              />
              <StatCard
                title="Tổng chi phí quản lý"
                value="12,500,000₫"
                icon="💰"
                color="warning"
              />
              <StatCard
                title="Mức độ hài lòng"
                value="95%"
                icon="📈"
                color="info"
              />
            </div>
          </Section>

          {/* Charts Section */}
          <div className={`${styles.chartsSection} ${styles.animateOnScroll}`}>
            <div className={styles.chartsGrid}>
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>📊 Hoạt động theo tháng</h3>
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width='100%' height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='name' />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey='games' fill='#4ade80' name='Trận đấu' />
                      <Bar dataKey='members' fill='#60a5fa' name='Thành viên' />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>💸 Phân bổ chi phí</h3>
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width='100%' height={300}>
                    <PieChart>
                      <Pie
                        data={costData}
                        cx='50%'
                        cy='50%'
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${((percent || 0) * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill='#8884d8'
                        dataKey='value'
                      >
                        {costData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
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

          {/* System Features Overview */}
          <Section className={`${styles.infoSection} ${styles.animateOnScroll}`}>
            <div className={styles.infoGrid}>
              <InfoCard
                title="🎯 Tính năng chính"
                variant="info"
              >
                <ul className={styles.featureList}>
                  <li>✅ Quản lý thành viên (thêm/sửa/xóa)</li>
                  <li>✅ Ghi lại chi tiết từng trận đấu</li>
                  <li>✅ Tự động chia tiền theo số người chơi</li>
                  <li>✅ Theo dõi thanh toán realtime</li>
                  <li>✅ Tạo QR code chuyển khoản</li>
                  <li>✅ Báo cáo thống kê chi tiết</li>
                </ul>
              </InfoCard>

              <InfoCard
                title="📋 Hướng dẫn sử dụng"
                variant="success"
              >
                <div className={styles.stepsList}>
                  <div className={styles.step}>
                    <span className={styles.stepNumber}>1</span>
                    <span>Thêm thành viên vào hệ thống</span>
                  </div>
                  <div className={styles.step}>
                    <span className={styles.stepNumber}>2</span>
                    <span>Tạo trận đấu mới với chi phí</span>
                  </div>
                  <div className={styles.step}>
                    <span className={styles.stepNumber}>3</span>
                    <span>Chọn người tham gia</span>
                  </div>
                  <div className={styles.step}>
                    <span className={styles.stepNumber}>4</span>
                    <span>Chia sẻ QR thanh toán</span>
                  </div>
                </div>
              </InfoCard>

              <InfoCard
                title="💡 Mẹo sử dụng"
                variant="warning"
              >
                <div className={styles.tipsList}>
                  <div className={styles.tip}>
                    <span className={styles.tipIcon}>🏸</span>
                    <span>Nhập "Chi phí khác" cho nước uống, vợt dự phòng</span>
                  </div>
                  <div className={styles.tip}>
                    <span className={styles.tipIcon}>💰</span>
                    <span>
                      Hệ thống tự động chia đều tiền cho tất cả thành viên
                    </span>
                  </div>
                  <div className={styles.tip}>
                    <span className={styles.tipIcon}>📱</span>
                    <span>QR code có thể mở trực tiếp app ngân hàng</span>
                  </div>
                  <div className={styles.tip}>
                    <span className={styles.tipIcon}>👥</span>
                    <span>Theo dõi ai đã thanh toán, ai chưa thanh toán</span>
                  </div>
                </div>
              </InfoCard>
            </div>
          </Section>

          {/* Notification Demo Section */}
          <div className={`${styles.demoSection} ${styles.animateOnScroll}`}>
            <NotificationDemo />
          </div>

          {/* Demo Preview Section */}
          <div className={`${styles.demoSection} ${styles.animateOnScroll}`}>
            <div className={styles.demoContent}>
              <h2 className={styles.demoTitle}>🎮 Xem trước Demo</h2>
              <p className={styles.demoDescription}>
                Khám phá giao diện và tính năng của hệ thống qua các màn hình
                demo
              </p>

              <div className={styles.demoGrid}>
                <div className={styles.demoCard}>
                  <div className={styles.demoImage}>👥</div>
                  <h3 className={styles.demoCardTitle}>Quản lý Thành viên</h3>
                  <p className={styles.demoCardDesc}>
                    Thêm, sửa, xóa thành viên. Tìm kiếm nhanh và quản lý thông
                    tin liên lạc.
                  </p>
                  <div className={styles.demoStats}>
                    <span className={styles.demoStat}>📊 89 thành viên</span>
                    <span className={styles.demoStat}>
                      ⚡ Tìm kiếm realtime
                    </span>
                  </div>
                </div>

                <div className={styles.demoCard}>
                  <div className={styles.demoImage}>📅</div>
                  <h3 className={styles.demoCardTitle}>Lịch sử Game</h3>
                  <p className={styles.demoCardDesc}>
                    Ghi lại từng trận đấu với chi phí sân, cầu, và các khoản phụ
                    thu.
                  </p>
                  <div className={styles.demoStats}>
                    <span className={styles.demoStat}>🏸 247 trận đấu</span>
                    <span className={styles.demoStat}>💰 12.5M đã quản lý</span>
                  </div>
                </div>

                <div className={styles.demoCard}>
                  <div className={styles.demoImage}>💳</div>
                  <h3 className={styles.demoCardTitle}>Thanh toán QR</h3>
                  <p className={styles.demoCardDesc}>
                    Tạo QR code tự động, kết nối app ngân hàng, theo dõi thanh
                    toán.
                  </p>
                  <div className={styles.demoStats}>
                    <span className={styles.demoStat}>📱 Mở app ngân hàng</span>
                    <span className={styles.demoStat}>
                      ✅ Theo dõi realtime
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.demoActions}>
                <Link href='/login' className={styles.demoButton}>
                  <span>🔑</span>
                  <span>Đăng nhập</span>
                  <small>(admin / password123)</small>
                </Link>
                <Link href='/members' className={styles.demoButton}>
                  <span>👀</span>
                  <span>Xem chế độ khách</span>
                  <small>(Chỉ xem, không chỉnh sửa)</small>
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
        </Section>
      </Container>
    </div>
  )
}

export default HomePage
