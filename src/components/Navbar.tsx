"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const Navbar = () => {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)

  const navigation = [
    { name: "Home", href: "/", icon: "🏠" },
    { name: "Members", href: "/members", icon: "👥" },
    { name: "Game History", href: "/history", icon: "📅" },
    { name: "Admin", href: "/login", icon: "🔐" },
  ]

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav className='navbar'>
      <div className='navbar-container'>
        <div className='navbar-content'>
          {/* Logo */}
          <Link href='/' className='navbar-logo'>
            <div className='navbar-logo-icon'>🏸</div>
            <span className='navbar-logo-text'>Badminton Manager</span>
          </Link>

          {/* Navigation */}
          <div className='navbar-nav'>
            {navigation.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className={`navbar-nav-item ${
                  isActive(item.href) ? "active" : ""
                }`}
              >
                <span className='navbar-nav-icon'>{item.icon}</span>
                <span className='navbar-nav-text'>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
