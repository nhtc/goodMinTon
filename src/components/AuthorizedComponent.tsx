"use client"
import React from "react"
import { useAuth } from "@/context/AuthContext"

interface AuthorizedComponentProps {
  children: React.ReactNode
  fallback?: React.ReactElement | null
  requireAuth?: boolean
  requireEdit?: boolean // New prop for edit-specific permissions
  viewOnlyFallback?: React.ReactElement | null // Fallback component for view-only users
}

export const AuthorizedComponent: React.FC<AuthorizedComponentProps> = ({
  children,
  fallback = null,
  requireAuth = false, // Changed default to false - viewing doesn't require auth
  requireEdit = false,
  viewOnlyFallback = null,
}) => {
  const { isAuthorized, isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className='auth-loading'>
        <div className='spinner'></div>
        <span className='auth-loading-text'>Đang kiểm tra quyền...</span>
      </div>
    )
  }

  // Check edit permissions first (this covers both auth and authorization)
  if (requireEdit) {
    // If not authenticated at all, show fallback
    if (!isAuthenticated) {
      return (
        viewOnlyFallback || fallback || (
          <div className='auth-error'>
            <span className='auth-icon'>🔐</span>
            <h3>Cần đăng nhập</h3>
            <p>Vui lòng đăng nhập để sử dụng tính năng này</p>
            <a href='/login' className='auth-login-btn'>
              Đăng nhập
            </a>
          </div>
        )
      )
    }
    
    // If authenticated but not authorized, show view-only fallback
    if (!isAuthorized) {
      return (
        viewOnlyFallback || (
          <div className='auth-view-only'>
            <span className='auth-icon'>👁️</span>
            <h3>Chế độ xem</h3>
            <p>Bạn chỉ có quyền xem. Liên hệ quản trị viên để chỉnh sửa.</p>
            <div className='auth-user-info'>
              <span>Đăng nhập như: {user?.name || "Người dùng"}</span>
              <span className='auth-role'>({user?.role || "viewer"})</span>
            </div>
          </div>
        )
      )
    }
  }

  // Check authentication only (only if explicitly required and not already checked above)
  if (requireAuth && !requireEdit && !isAuthenticated) {
    return (
      fallback || (
        <div className='auth-error'>
          <span className='auth-icon'>🔐</span>
          <h3>Cần đăng nhập</h3>
          <p>Vui lòng đăng nhập để sử dụng tính năng này</p>
          <a href='/login' className='auth-login-btn'>
            Đăng nhập
          </a>
        </div>
      )
    )
  }

  return <>{children}</>
}

// Higher order component for protecting routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options: { requireAuth?: boolean; requireEdit?: boolean } = {}
) => {
  return function AuthorizedPage(props: P) {
    return (
      <AuthorizedComponent
        requireAuth={options.requireAuth}
        requireEdit={options.requireEdit}
      >
        <Component {...props} />
      </AuthorizedComponent>
    )
  }
}

// Component for conditional rendering based on permissions
export const EditableContent: React.FC<{
  children: React.ReactNode
  viewContent?: React.ReactNode
  className?: string
}> = ({ children, viewContent, className }) => {
  const { isAuthorized, isAuthenticated } = useAuth()

  // If user is not authenticated, show view content or nothing
  if (!isAuthenticated) {
    return viewContent ? <div className={className}>{viewContent}</div> : null
  }

  // If user is authenticated but not authorized, show view content
  if (!isAuthorized && viewContent) {
    return <div className={className}>{viewContent}</div>
  }

  // If user is authenticated but not authorized and no view content, show nothing
  if (!isAuthorized) {
    return null
  }

  // User is authenticated and authorized, show edit content
  return <div className={className}>{children}</div>
}

// Hook for checking permissions in components
export const usePermissions = () => {
  const { isAuthorized, isAuthenticated, user } = useAuth()

  return {
    canEdit: isAuthenticated && isAuthorized, // Only authenticated users with proper role can edit
    canView: true, // Anyone can view
    userRole: user?.role || "guest", // Show guest for non-authenticated users
    isAdmin: user?.role === "admin",
    isEditor: user?.role === "editor",
    isViewer: user?.role === "viewer",
    isGuest: !isAuthenticated, // New property to identify guests
  }
}
