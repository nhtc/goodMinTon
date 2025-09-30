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

  const getRoleStyles = (role: string) => {
    switch (role) {
      case "admin":
        return {
          class: styles.userRoleAdmin,
          icon: "👑",
          text: "Admin"
        }
      case "editor":
        return {
          class: styles.userRoleEditor,
          icon: "✏️",
          text: "Editor"
        }
      default:
        return {
          class: styles.userRoleViewer,
          icon: "👁️",
          text: "Viewer"
        }
    }
  }

  return (
    <nav 
      className={`${styles.navbarWrapper} ${
        isScrolled ? styles.navbarScrolled : styles.navbarDefault
      }`}
    >
      <div className={styles.navbarContainer}>
        <div className={styles.navbarContent}>
          {/* Logo */}
          <Link href="/" className={styles.navbarLogo}>
            <div className={styles.navbarLogoIcon}>🏸</div>
            <span className={styles.navbarLogoText}>Badminton Manager</span>
          </Link>

          {/* Desktop Navigation - Using Radix UI NavigationMenu */}
          <div className={styles.navbarDesktop}>
            <NavigationMenu.Root className={styles.navbarNav}>
              <NavigationMenu.List className={styles.navbarNavList}>
                {navigation.map(item => (
                  <NavigationMenu.Item key={item.name} className={styles.navbarNavItem}>
                    <NavigationMenu.Link asChild>
                      <Link
                        href={item.href}
                        className={`${styles.navbarNavLink} ${
                          isActive(item.href) ? styles.navbarNavLinkActive : ""
                        }`}
                      >
                        <span className={styles.navbarNavIcon}>{item.icon}</span>
                        <span className={styles.navbarNavText}>{item.name}</span>
                      </Link>
                    </NavigationMenu.Link>
                  </NavigationMenu.Item>
                ))}
              </NavigationMenu.List>
            </NavigationMenu.Root>
          </div>

          {/* User Section */}
          <div className={styles.navbarUser}>
            {isAuthenticated && user ? (
              <>
                {/* User Info with Dropdown Menu */}
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className={styles.userInfo} aria-label="User menu">
                      <div className={styles.userAvatar}>
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className={styles.userDetails}>
                        <div className={styles.userName}>{user.name}</div>
                        <div className={`${styles.userRole} ${getRoleStyles(userRole).class}`}>
                          <span>{getRoleStyles(userRole).icon}</span>
                          <span>{getRoleStyles(userRole).text}</span>
                        </div>
                      </div>
                    </button>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Portal>
                    <DropdownMenu.Content className={styles.dropdownContent} align="end">
                      <DropdownMenu.Item className={styles.dropdownItem} disabled>
                        <span className={styles.dropdownItemIcon}>👤</span>
                        <span>{user.name}</span>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className={styles.dropdownSeparator} />
                      <DropdownMenu.Item className={styles.dropdownItem} onClick={logout}>
                        <span className={styles.dropdownItemIcon}>�</span>
                        <span>Đăng xuất</span>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </>
            ) : (
              <div className={styles.navbarGuest}>
                {/* Guest Info */}
                <div className={styles.guestInfo}>
                  <span className={styles.guestRole}>
                    <span>�️</span>
                    <span>Chỉ xem</span>
                  </span>
                </div>

                {/* Login Button */}
                <Link href="/login" className={styles.loginBtn}>
                  <span>🔐</span>
                  <span>Đăng nhập</span>
                </Link>
              </div>
            )}
          </div>
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
