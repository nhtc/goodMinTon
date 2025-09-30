"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { usePermissions } from "./AuthorizedComponent"

const Navbar = () => {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const { userRole, canEdit } = usePermissions()

  const navigation = [
    { name: "Nhà", href: "/", icon: "🏠" },
    { name: "Thành Viên", href: "/members", icon: "👥" },
    { name: "Cầu lông", href: "/history", icon: "🏸" },
    { name: "Tiệc tùng", href: "/personal-tracking", icon: "🎉" },
    { name: "QR Thanh toán", href: "/payment", icon: "💳" },
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

  const getRoleStyles = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300"
      case "editor":
        return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300"
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300"
    }
  }

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? "bg-white/95 backdrop-blur-xl shadow-xl border-b border-gray-200/70" 
        : "bg-gradient-to-b from-white/90 to-white/80 backdrop-blur-lg shadow-lg border-b border-gray-100/50"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-3 group hover:scale-105 transition-transform duration-200"
          >
            <div className="text-2xl group-hover:animate-bounce">🏸</div>
            <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Badminton Manager
            </span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-gray-200/50">
            {navigation.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                  transition-all duration-300 hover:scale-105 hover:-translate-y-0.5
                  relative overflow-hidden group
                  ${isActive(item.href)
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/50"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 shadow-md hover:shadow-lg border border-gray-200/70 hover:border-blue-300/50 bg-white/90"
                  }
                `}
              >
                <span className={`text-lg transition-transform duration-300 group-hover:scale-110 ${
                  isActive(item.href) ? "drop-shadow-sm" : ""
                }`}>
                  {item.icon}
                </span>
                <span className="hidden lg:block tracking-wide">{item.name}</span>
                
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && user ? (
              <>
                {/* User Info */}
                <div className="hidden sm:flex items-center space-x-3 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg border border-gray-200/50">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/30">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="hidden md:block">
                    <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                    <div className={`text-xs px-3 py-1 rounded-full border font-medium shadow-sm ${getRoleStyles(userRole)}`}>
                      {userRole === "admin" && "👑 Admin"}
                      {userRole === "editor" && "✏️ Editor"}
                      {userRole === "viewer" && "👁️ Viewer"}
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 rounded-xl hover:from-red-100 hover:to-pink-100 hover:text-red-700 transition-all duration-300 text-sm font-semibold shadow-md hover:shadow-lg border border-red-200/50 hover:border-red-300/50 hover:scale-105"
                  title="Đăng xuất"
                >
                  <span className="text-base">🚪</span>
                  <span className="hidden sm:block">Đăng xuất</span>
                </button>
              </>
            ) : (
              <>
                {/* Guest Info */}
                <div className="hidden sm:flex items-center space-x-2 text-gray-600 text-sm bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl shadow-md border border-gray-200/50 font-medium">
                  <span className="text-base">👁️</span>
                  <span>Chỉ xem</span>
                </div>

                {/* Login Button */}
                <Link
                  href="/login"
                  className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105 border border-blue-400/50 relative overflow-hidden group"
                >
                  <span className="text-base">🔐</span>
                  <span>Đăng nhập</span>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex items-center space-x-3 overflow-x-auto px-4 mobile-nav-scroll">
            {navigation.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex flex-col items-center space-y-1.5 px-4 py-3 rounded-xl text-xs font-semibold
                  transition-all duration-300 whitespace-nowrap min-w-max
                  shadow-md border backdrop-blur-sm
                  ${isActive(item.href)
                    ? "bg-gradient-to-b from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 border-blue-400/50 scale-105"
                    : "text-gray-700 hover:text-blue-700 bg-white/90 hover:bg-gradient-to-b hover:from-blue-50 hover:to-purple-50 border-gray-200/70 hover:border-blue-300/50 hover:shadow-lg hover:scale-105"
                  }
                `}
              >
                <span className={`text-xl transition-transform duration-300 ${
                  isActive(item.href) ? "drop-shadow-sm scale-110" : "hover:scale-110"
                }`}>
                  {item.icon}
                </span>
                <span className="tracking-wide">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
