import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import styles from './NavbarMenu.module.css'

interface NavigationItem {
  name: string
  href: string
  icon: string
}

interface NavbarMenuProps {
  navigation: NavigationItem[]
  className?: string
}

// Custom hook for navigation logic
const useNavigation = () => {
  const pathname = usePathname()
  
  const isActive = (href: string): boolean => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }
  
  return { isActive }
}

// Single navigation item component
const NavigationItem: React.FC<{
  item: NavigationItem
  isActive: boolean
}> = ({ item, isActive }) => (
  <NavigationMenu.Item className={styles.navbarNavItem}>
    <NavigationMenu.Link asChild>
      <Link
        href={item.href}
        className={`${styles.navbarNavLink} ${
          isActive ? styles.navbarNavLinkActive : ""
        }`}
      >
        <span className={styles.navbarNavIcon}>{item.icon}</span>
        <span className={styles.navbarNavText}>{item.name}</span>
      </Link>
    </NavigationMenu.Link>
  </NavigationMenu.Item>
)

const NavbarMenu: React.FC<NavbarMenuProps> = ({ navigation, className = '' }) => {
  const { isActive } = useNavigation()
  const menuClasses = [styles.navbarMenu, className].filter(Boolean).join(' ')

  return (
    <div className={menuClasses}>
      <NavigationMenu.Root className={styles.navbarNav}>
        <NavigationMenu.List className={styles.navbarNavList}>
          {navigation.map(item => (
            <NavigationItem
              key={item.name}
              item={item}
              isActive={isActive(item.href)}
            />
          ))}
        </NavigationMenu.List>
      </NavigationMenu.Root>
    </div>
  )
}

export default NavbarMenu