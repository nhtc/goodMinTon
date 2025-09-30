import React from 'react'
import Link from 'next/link'
import styles from './NavbarLogo.module.css'

const NavbarLogo: React.FC = () => {
  return (
    <Link href="/" className={styles.navbarLogo}>
      <div className={styles.navbarLogoIcon}>🏸</div>
      <span className={styles.navbarLogoText}>Badminton Manager</span>
    </Link>
  )
}

export default NavbarLogo