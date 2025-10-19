import React from 'react'
import styles from './Pagination.module.css'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  total: number
  limit: number
  showInfo?: boolean
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  total,
  limit,
  showInfo = true,
}) => {
  // Calculate range of items being displayed
  const startItem = (currentPage - 1) * limit + 1
  const endItem = Math.min(currentPage * limit, total)

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 7

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className={styles.paginationContainer}>
      {showInfo && (
        <div className={styles.paginationInfo}>
          Hiển thị <strong>{startItem}</strong> - <strong>{endItem}</strong> trong tổng số{' '}
          <strong>{total}</strong> kết quả
        </div>
      )}

      <div className={styles.paginationControls}>
        {/* Previous Button */}
        <button
          className={`${styles.paginationButton} ${styles.navButton}`}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Trang trước"
        >
          <span>←</span>
          <span className={styles.buttonText}>Trước</span>
        </button>

        {/* Page Numbers */}
        <div className={styles.pageNumbers}>
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                  ...
                </span>
              )
            }

            return (
              <button
                key={page}
                className={`${styles.pageButton} ${
                  currentPage === page ? styles.active : ''
                }`}
                onClick={() => onPageChange(page as number)}
                aria-label={`Trang ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            )
          })}
        </div>

        {/* Next Button */}
        <button
          className={`${styles.paginationButton} ${styles.navButton}`}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Trang sau"
        >
          <span className={styles.buttonText}>Sau</span>
          <span>→</span>
        </button>
      </div>
    </div>
  )
}

export default Pagination
