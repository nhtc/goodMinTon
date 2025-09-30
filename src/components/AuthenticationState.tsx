import React from 'react'
import Link from 'next/link'
import UserAvatar from './Layout/UserAvatar'
import RoleBadge from './Layout/RoleBadge'
import styles from './AuthenticationState.module.css'

interface User {
  name?: string
  email?: string
}

interface AuthenticationStateProps {
  isAuthenticated: boolean
  user: User | null
  userRole: string
  onLogout: () => void
  isLoading?: boolean
  className?: string
}

const AuthenticationState: React.FC<AuthenticationStateProps> = ({
  isAuthenticated,
  user,
  userRole,
  onLogout,
  isLoading = false,
  className = ''
}) => {
  const containerClasses = [styles.authState, className].filter(Boolean).join(' ')

  if (isLoading) {
    return (
      <div className={containerClasses}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}>⏳</div>
          <span className={styles.loadingText}>Đang tải...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className={containerClasses}>
        <div className={styles.guestState}>
          <div className={styles.guestInfo}>
            <span className={styles.guestIcon}>👁️</span>
            <div className={styles.guestDetails}>
              <span className={styles.guestTitle}>Chế độ khách</span>
              <span className={styles.guestDescription}>Quyền xem giới hạn</span>
            </div>
          </div>
          <Link href="/login" className={styles.loginButton}>
            <span className={styles.loginIcon}>🔐</span>
            <span>Đăng nhập</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={containerClasses}>
      <div className={styles.authenticatedState}>
        <div className={styles.userProfile}>
          <UserAvatar user={user} size="lg" />
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.name || user.email}</span>
            <RoleBadge role={userRole} />
          </div>
        </div>
        <button 
          onClick={onLogout}
          className={styles.logoutButton}
          aria-label="Đăng xuất"
        >
          <span className={styles.logoutIcon}>🚪</span>
          <span className={styles.logoutText}>Đăng xuất</span>
        </button>
      </div>
    </div>
  )
}

export default AuthenticationState