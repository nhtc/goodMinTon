import React from 'react'
import styles from './Section.module.css'

interface SectionProps {
  children: React.ReactNode
  spacing?: 'sm' | 'md' | 'lg' | 'xl'
  background?: 'transparent' | 'white' | 'gray' | 'primary' | 'accent'
  className?: string
}

const Section: React.FC<SectionProps> = ({ 
  children, 
  spacing = 'lg',
  background = 'transparent',
  className = '' 
}) => {
  const sectionClasses = [
    styles.section,
    styles[`spacing${spacing.charAt(0).toUpperCase() + spacing.slice(1)}`],
    styles[`background${background.charAt(0).toUpperCase() + background.slice(1)}`],
    className
  ].filter(Boolean).join(' ')

  return (
    <section className={sectionClasses}>
      {children}
    </section>
  )
}

export default Section