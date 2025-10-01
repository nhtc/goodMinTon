import React from "react"
import styles from "./FormSection.module.css"

interface FormSectionProps {
  children: React.ReactNode
  title?: string
  description?: string
  icon?: string
  className?: string
}

const FormSection: React.FC<FormSectionProps> = ({
  children,
  title,
  description,
  icon,
  className = "",
}) => {
  return (
    <div className={`${styles.section} ${className}`}>
      {(title || description || icon) && (
        <div className={styles.header}>
          {icon && <div className={styles.icon}>{icon}</div>}
          <div className={styles.content}>
            {title && <h3 className={styles.title}>{title}</h3>}
            {description && <p className={styles.description}>{description}</p>}
          </div>
        </div>
      )}
      <div className={styles.body}>
        {children}
      </div>
    </div>
  )
}

export default FormSection