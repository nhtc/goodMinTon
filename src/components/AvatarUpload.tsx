"use client"
import React, { useState, useRef } from 'react'
import styles from './AvatarUpload.module.css'
import { 
  processAvatarImage, 
  validateAvatarFile, 
  createImagePreview, 
  cleanupImagePreview,
  formatFileSize 
} from '../utils/avatarUpload'
import { getConsistentAvatar } from '../utils/avatar'

interface AvatarUploadProps {
  currentAvatar?: string
  memberName: string
  onAvatarChange: (avatarData: string) => void
  disabled?: boolean
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  memberName,
  onAvatarChange,
  disabled = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string>('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get fallback avatar
  const fallbackAvatar = currentAvatar || getConsistentAvatar(memberName)

  const handleFileSelect = async (file: File) => {
    setError('')
    
    // Validate file
    const validation = validateAvatarFile(file)
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file')
      return
    }

    try {
      setIsProcessing(true)
      
      // Create preview
      const preview = createImagePreview(file)
      setPreviewUrl(preview)
      
      // Process the image
      const processedImage = await processAvatarImage(file)
      
      // Clean up preview
      cleanupImagePreview(preview)
      
      // Set the processed image as preview and notify parent
      setPreviewUrl(processedImage)
      onAvatarChange(processedImage)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image')
      if (previewUrl) {
        cleanupImagePreview(previewUrl)
        setPreviewUrl(null)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const handleRemoveAvatar = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      cleanupImagePreview(previewUrl)
    }
    setPreviewUrl(null)
    setError('')
    onAvatarChange(fallbackAvatar)
  }

  const handleGenerateNew = () => {
    const newAvatar = getConsistentAvatar(memberName + Date.now())
    onAvatarChange(newAvatar)
    if (previewUrl && previewUrl.startsWith('blob:')) {
      cleanupImagePreview(previewUrl)
    }
    setPreviewUrl(null)
    setError('')
  }

  const displayAvatar = previewUrl || currentAvatar || fallbackAvatar

  return (
    <div className={styles.avatarUpload}>
      <div className={styles.avatarSection}>
        <div 
          className={`${styles.avatarContainer} ${dragOver ? styles.dragOver : ''} ${disabled ? styles.disabled : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <div className={styles.avatarDisplay}>
            <img 
              src={displayAvatar} 
              alt={`${memberName}'s avatar`}
              className={styles.avatarImage}
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(memberName)}&size=200&background=6366f1&color=fff&bold=true`
              }}
            />
            {isProcessing && (
              <div className={styles.processingOverlay}>
                <div className={styles.spinner}></div>
                <span>Processing...</span>
              </div>
            )}
          </div>
          
          <div className={styles.uploadPrompt}>
            {!disabled && (
              <>
                <div className={styles.uploadIcon}>📸</div>
                <div className={styles.uploadText}>
                  <div className={styles.primaryText}>Click or drag to upload</div>
                  <div className={styles.secondaryText}>JPG, PNG, GIF up to 5MB</div>
                </div>
              </>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className={styles.hiddenInput}
          disabled={disabled}
        />
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <span className={styles.errorIcon}>⚠️</span>
          {error}
        </div>
      )}

      {!disabled && (
        <div className={styles.controls}>
          <button
            type="button"
            onClick={handleGenerateNew}
            className={styles.controlBtn}
            disabled={isProcessing}
          >
            <span className={styles.btnIcon}>🎲</span>
            Generate New
          </button>
          
          {(previewUrl || currentAvatar !== fallbackAvatar) && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className={`${styles.controlBtn} ${styles.removeBtn}`}
              disabled={isProcessing}
            >
              <span className={styles.btnIcon}>🗑️</span>
              Reset
            </button>
          )}
        </div>
      )}

      <div className={styles.info}>
        <div className={styles.infoItem}>
          <span className={styles.infoIcon}>💡</span>
          <span>Images are automatically resized to 200x200px and optimized for web</span>
        </div>
      </div>
    </div>
  )
}

export default AvatarUpload
