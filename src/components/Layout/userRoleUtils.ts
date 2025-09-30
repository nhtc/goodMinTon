// User role constants and utilities
export const USER_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer'
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

export interface RoleConfig {
  icon: string
  text: string
  displayName: string
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  [USER_ROLES.ADMIN]: {
    icon: '👑',
    text: 'Admin',
    displayName: 'Quản trị viên'
  },
  [USER_ROLES.EDITOR]: {
    icon: '✏️',
    text: 'Editor', 
    displayName: 'Biên tập viên'
  },
  [USER_ROLES.VIEWER]: {
    icon: '👁️',
    text: 'Viewer',
    displayName: 'Người xem'
  }
}

export const getRoleConfig = (role: string): RoleConfig => {
  return ROLE_CONFIGS[role as UserRole] || ROLE_CONFIGS[USER_ROLES.VIEWER]
}

export const getDefaultInitials = (user: { name?: string; email?: string } | null): string => {
  if (!user) return 'U'
  return user.name?.charAt(0).toUpperCase() || 
         user.email?.charAt(0).toUpperCase() || 
         'U'
}