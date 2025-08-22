"use client"
import React, { useState, useEffect } from 'react'
import styles from './AvatarManager.module.css'
import AvatarUpload from './AvatarUpload'

interface Member {
  id: string
  name: string
  phone?: string
  avatar?: string
  isActive: boolean
  createdAt: string
}

interface AvatarManagerProps {
  member: Member
  onUpdate: (updatedMember: Member) => void
}

const AvatarManager: React.FC<AvatarManagerProps> = ({
  member,
  onUpdate
}) => {
  const [avatarUrl, setAvatarUrl] = useState(member.avatar || '')
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSave = async () => {
    try {
      setIsUpdating(true)
      setError('')
      setSuccess('')

      const response = await fetch(`/api/members/${member.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: member.name,
          phone: member.phone,
          avatar: avatarUrl,
          isActive: member.isActive,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update avatar')
      }

      const updatedMember = await response.json()
      setSuccess('Avatar updated successfully!')
      onUpdate(updatedMember)
      
      // The parent component will handle closing the modal

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update avatar')
    } finally {
      setIsUpdating(false)
    }
  }

  const hasChanges = avatarUrl !== member.avatar

  return (
    <div className={styles.avatarManager}>
      <div className={styles.content}>
        <AvatarUpload
          currentAvatar={avatarUrl}
          memberName={member.name}
          onAvatarChange={setAvatarUrl}
          disabled={isUpdating}
        />

        {error && (
          <div className={styles.error}>
            <span className={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className={styles.success}>
            <span className={styles.successIcon}>✅</span>
            {success}
          </div>
        )}

        <div className={styles.actions}>
          <button
            onClick={handleSave}
            className={`${styles.saveBtn} ${!hasChanges ? styles.disabled : ''}`}
            disabled={isUpdating || !hasChanges}
          >
            {isUpdating ? (
              <>
                <div className={styles.spinner}></div>
                Updating...
              </>
            ) : (
              <>
                <span className={styles.btnIcon}>💾</span>
                Save Avatar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AvatarManager
