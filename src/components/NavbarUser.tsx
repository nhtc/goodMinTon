import React from 'react'
import Link from 'next/link'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import UserAvatar from './UserAvatar'
import RoleBadge from './RoleBadge'
import styles from './NavbarUser.module.css'

interface User {
  name?: string
  email?: string
}

interface NavbarUserProps {
  isAuthenticated: boolean
  user: User | null
  userRole: string
  onLogout: () => void
  className?: string
}

// Component for guest state
const GuestSection: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={className}>
    {/* <div className={styles.guestInfo}>
      <span className={styles.guestRole}>
        <span>👁️</span>
        <span>Chỉ xem</span>
      </span>
    </div> */}
    <Link href="/login" className={styles.loginBtn}>
      <span>🔐</span>
      <span>Đăng nhập</span>
    </Link>
  </div>
)

// Component for authenticated user
const AuthenticatedSection: React.FC<{
  user: User
  userRole: string
  onLogout: () => void
  className?: string
}> = ({ user, userRole, onLogout, className = '' }) => (
  <div className={className}>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className={styles.userInfo} aria-label="User menu">
          <UserAvatar user={user} />
          <div className={styles.userDetails}>
            <div className={styles.userName}>{user.name || user.email}</div>
            <RoleBadge role={userRole} variant="compact" />
          </div>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className={styles.dropdownContent} align="end">
          {/* <DropdownMenu.Item className={styles.dropdownItem} disabled>
            <span className={styles.dropdownItemIcon}>👤</span>
            <span>{user.name || user.email}</span>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className={styles.dropdownSeparator} /> */}
          <DropdownMenu.Item className={styles.dropdownItem} onClick={onLogout}>
            <span className={styles.dropdownItemIcon}>🚪</span>
            <span>Đăng xuất</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  </div>
)

const NavbarUser: React.FC<NavbarUserProps> = ({ 
  isAuthenticated, 
  user, 
  userRole, 
  onLogout,
  className = '' 
}) => {
  const userClasses = [styles.navbarUser, className].filter(Boolean).join(' ')

  if (!isAuthenticated || !user) {
    return <GuestSection className={userClasses} />
  }

  return (
    <AuthenticatedSection
      user={user}
      userRole={userRole}
      onLogout={onLogout}
      className={userClasses}
    />
  )
}

export default NavbarUser