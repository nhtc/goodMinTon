import React from 'react'
import styles from './RoleBadge.module.css'
import {getRoleConfig} from '@/utils/userRoleUtils'

interface RoleBadgeProps {
  role: string
  variant?: 'default' | 'compact'
  className?: string
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ 
  role, 
  variant = 'default',
  className = '' 
}) => {
  const roleConfig = getRoleConfig(role)
  
  const badgeClasses = [
    styles.roleBadge,
    styles[`variant${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    styles[`role${role.charAt(0).toUpperCase() + role.slice(1)}`],
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={badgeClasses}>
      <span className={styles.roleIcon}>{roleConfig.icon}</span>
      <span className={styles.roleText}>
        {variant === 'compact' ? roleConfig.text : roleConfig.displayName}
      </span>
    </div>
  )
}

export default RoleBadge