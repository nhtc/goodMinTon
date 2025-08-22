/**
 * Avatar upload and processing utilities
 */

/**
 * Compress and resize an image file
 * @param file - The image file to process
 * @param maxWidth - Maximum width in pixels (default: 200)
 * @param maxHeight - Maximum height in pixels (default: 200)
 * @param quality - JPEG quality 0-1 (default: 0.8)
 * @returns Promise<string> - Base64 data URL of the processed image
 */
export async function processAvatarImage(
  file: File,
  maxWidth: number = 200,
  maxHeight: number = 200,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('File must be an image'))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('File size must be less than 5MB'))
      return
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // Draw and compress the image
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to base64 with specified quality
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      
      // Check if the result is too large (max 500KB for base64)
      if (dataUrl.length > 500 * 1024) {
        // Recursively reduce quality if too large
        if (quality > 0.3) {
          processAvatarImage(file, maxWidth, maxHeight, quality - 0.1)
            .then(resolve)
            .catch(reject)
          return
        } else {
          reject(new Error('Unable to compress image to acceptable size'))
          return
        }
      }

      resolve(dataUrl)
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    // Read the file and set image source
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target?.result as string
    }
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Validate avatar image file
 * @param file - The file to validate
 * @returns object with validation result and error message
 */
export function validateAvatarFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Chỉ chấp nhận file hình ảnh (JPG, PNG, GIF, WebP)' }
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { isValid: false, error: 'Kích thước file không được vượt quá 5MB' }
  }

  // Check supported formats
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!supportedTypes.includes(file.type)) {
    return { isValid: false, error: 'Định dạng file không được hỗ trợ. Vui lòng sử dụng JPG, PNG, GIF hoặc WebP' }
  }

  return { isValid: true }
}

/**
 * Create a preview URL for an image file
 * @param file - The image file
 * @returns string - Object URL for preview
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file)
}

/**
 * Clean up preview URL to prevent memory leaks
 * @param url - The object URL to revoke
 */
export function cleanupImagePreview(url: string): void {
  URL.revokeObjectURL(url)
}

/**
 * Get file size in human readable format
 * @param bytes - Size in bytes
 * @returns string - Formatted size (e.g., "1.2 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
