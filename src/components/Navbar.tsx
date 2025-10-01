"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as Collapsible from "@radix-ui/react-collapsible"
import { useAuth } from "@/context/AuthContext"
import { usePermissions } from "./AuthorizedComponent"
import { NavbarLogo, NavbarMenu, NavbarUser } from "./Layout"
import styles from "./Navbar.module.css"

const Navbar = () => {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const { userRole, canEdit } = usePermissions()

  const navigation = [
    { name: "Nhà", href: "/", icon: "🏠" },
    { name: "Thành Viên", href: "/members", icon: "👥" },
    { name: "Cầu lông", href: "/history", icon: "🏸" },
    { name: "Tiệc tùng", href: "/personal-tracking", icon: "🎉" },
    { name: "QR Thanh toán", href: "/payment", icon: "💳" },
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
    <nav 
      className={`${styles.navbarWrapper} ${
        isScrolled ? styles.navbarScrolled : styles.navbarDefault
      }`}
    >
      <div className={styles.navbarContainer}>
        <div className={styles.navbarContent}>
          {/* Logo Component */}
          <NavbarLogo />

          {/* Desktop Navigation Menu Component */}
          <NavbarMenu navigation={navigation} className={styles.navbarDesktop} />

          {/* User Section Component */}
          <NavbarUser 
            isAuthenticated={isAuthenticated}
            user={user}
            userRole={userRole}
            onLogout={logout}
          />
        </div>

        {/* Mobile Navigation - Using Radix UI Collapsible */}
        <div className={styles.navbarMobile}>
          <Collapsible.Root open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <Collapsible.Trigger asChild>
              <button className={styles.mobileMenuButton} aria-label="Toggle mobile menu">
                <span className={styles.hamburgerIcon}>
                  {isMobileMenuOpen ? "✖️" : "☰"}
                </span>
              </button>
            </Collapsible.Trigger>
            
            <Collapsible.Content className={styles.mobileNavContent}>
              <div className={styles.mobileNavList}>
                {navigation.map(item => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`${styles.mobileNavLink} ${
                      isActive(item.href) ? styles.mobileNavLinkActive : ""
                    }`}
                  >
                    <span className={styles.mobileNavIcon}>{item.icon}</span>
                    <span className={styles.mobileNavText}>{item.name}</span>
                  </Link>
                ))}
              </div>
            </Collapsible.Content>
          </Collapsible.Root>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
