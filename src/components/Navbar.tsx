"use client"
import React, {useEffect, useState} from "react"
import Link from "next/link"
import {usePathname} from "next/navigation"
import {useAuth} from "@/context/AuthContext"
import {usePermissions} from "./AuthorizedComponent"
import styles from "./Navbar.module.css"
import NavbarUser from "@/components/NavbarUser"

const Navbar = () => {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const {isAuthenticated, user, logout} = useAuth()
  const {userRole, canEdit} = usePermissions()

  const navigation = [
    {name: "Nhà", href: "/", icon: "🏠"},
    {name: "Thành Viên", href: "/members", icon: "👥"},
    {name: "Cầu lông", href: "/history", icon: "🏸"},
    {name: "Tiệc tùng", href: "/personal-tracking", icon: "🎉"},
    {name: "QR Thanh toán", href: "/payment", icon: "💳"},
  ]

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <div className={styles.navbarContent}>
          {/* Logo */}
          <Link href='/' className={styles.navbarLogo}>
            <div className={styles.navbarLogoIcon}>🏸</div>
            <span className={styles.navbarLogoText}>Badminton Manager</span>
          </Link>

          {/* Navigation */}
          <div className={styles.navbarNav}>
            {navigation.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className={`${styles.navbarNavItem} ${isActive(item.href) ? styles.active : ""
                  }`}
              >
                <span className={styles.navbarNavIcon}>{item.icon}</span>
                <span className={styles.navbarNavText}>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* User Info or Login Button */}
          {/* {isAuthenticated && user ? (
            <div className={styles.navbarUser}>
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className={styles.userDetails}>
                  <span className={styles.userName}>{user.name}</span>
                  <span className={`${styles.userRole} ${styles[userRole]}`}>
                    {userRole === "admin" && "👑 Admin"}
                    {userRole === "editor" && "✏️ Editor"}
                    {userRole === "viewer" && "👁️ Viewer"}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className={styles.logoutBtn}
                title='Đăng xuất'
              >
                <span>🚪</span>
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className={styles.navbarGuest}>
              <div className={styles.guestInfo}>
                <span className={styles.guestRole}>👁️Chỉ xem</span>
              </div>
              <Link href='/login' className={styles.loginBtn}>
                <span>🔐</span>
                Đăng nhập Admin
              </Link>
            </div>
          )} */}

          <NavbarUser
            isAuthenticated={isAuthenticated}
            user={user}
            userRole={userRole}
            onLogout={logout} />
        </div>
      </div>
    </nav>
  )
}

export default Navbar
