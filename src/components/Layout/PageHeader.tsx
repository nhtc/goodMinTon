import React from 'react'
import styles from './PageHeader.module.css'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  breadcrumb?: React.ReactNode
  className?: string
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description,
  actions,
  breadcrumb,
  className = '' 
}) => {
  const headerClasses = [styles.pageHeader, className].filter(Boolean).join(' ')

  return (
    <header className={headerClasses}>
      {breadcrumb && (
        <div className={styles.breadcrumb}>
          {breadcrumb}
        </div>
      )}
      
      <div className={styles.headerContent}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{title}</h1>
          {description && (
            <p className={styles.description}>{description}</p>
          )}
        </div>
        
        {actions && (
          <div className={styles.actions}>
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}

export default PageHeader