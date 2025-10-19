import React from 'react'
import styles from './UserAvatar.module.css'
import {getDefaultInitials} from '@/utils/userRoleUtils'

interface User {
  name?: string
  email?: string
}

interface UserAvatarProps {
  user: User | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 'md',
  className = '' 
}) => {
  const avatarClasses = [
    styles.userAvatar,
    styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`],
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={avatarClasses}>
      {getDefaultInitials(user)}
    </div>
  )
}

export default UserAvatar