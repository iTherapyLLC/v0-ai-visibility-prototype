"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut, BarChart3 } from "lucide-react"

interface NavigationProps {
  onLogoClick?: () => void
}

export function Navigation({ onLogoClick }: NavigationProps = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem("geo_auth_token")
    const email = localStorage.getItem("geo_user_email")
    setIsAuthenticated(!!token)
    setUserEmail(email)
  }, [pathname])

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(path)
  }

  const handleLogoClick = (e: React.MouseEvent) => {
    if (onLogoClick) {
      e.preventDefault()
      onLogoClick()
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("geo_auth_token")
    localStorage.removeItem("geo_user_email")
    setIsAuthenticated(false)
    setUserEmail(null)
    router.push("/")
  }

  // Determine if we're on the main marketing page for anchor links
  const isMainPage = pathname === "/"
  const isGeoAuditPage = pathname.startsWith("/geo-audit")
  const isLoginPage = pathname === "/login"

  // Don't show full nav on login page
  if (isLoginPage) {
    return null
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#C5AA7D]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer group"
            onClick={handleLogoClick}
          >
            <div className="rounded-full border border-[#C5AA7D]/30 p-1.5 bg-white shadow-sm group-hover:shadow-[0_0_15px_rgba(197,170,125,0.3)] transition-all duration-300">
              <Image
                src="/images/featherstone-logo.png"
                alt="Featherstone Intelligence"
                width={32}
                height={32}
                priority
                className="h-8 w-8 object-contain"
              />
            </div>
            <span className="font-serif text-lg font-semibold text-[#2C2C2C] tracking-wide hidden sm:block">
              Featherstone
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {isMainPage ? (
              <>
                <a
                  href="#solutions"
                  className="relative px-4 py-2 text-sm font-medium text-[#2C2C2C]/70 hover:text-[#2C2C2C] transition-colors rounded-lg group"
                >
                  Solutions
                  <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-[#B87333] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </a>
                <a
                  href="#process"
                  className="relative px-4 py-2 text-sm font-medium text-[#2C2C2C]/70 hover:text-[#2C2C2C] transition-colors rounded-lg group"
                >
                  Process
                  <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-[#B87333] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </a>
                <a
                  href="#about"
                  className="relative px-4 py-2 text-sm font-medium text-[#2C2C2C]/70 hover:text-[#2C2C2C] transition-colors rounded-lg group"
                >
                  About
                  <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-[#B87333] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </a>
                <a
                  href="#contact"
                  className="relative px-4 py-2 text-sm font-medium text-[#2C2C2C]/70 hover:text-[#2C2C2C] transition-colors rounded-lg group"
                >
                  Contact
                  <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-[#B87333] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </a>
              </>
            ) : (
              <>
                <Link
                  href="/#solutions"
                  className="relative px-4 py-2 text-sm font-medium text-[#2C2C2C]/70 hover:text-[#2C2C2C] transition-colors rounded-lg group"
                >
                  Solutions
                  <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-[#B87333] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
                <Link
                  href="/#process"
                  className="relative px-4 py-2 text-sm font-medium text-[#2C2C2C]/70 hover:text-[#2C2C2C] transition-colors rounded-lg group"
                >
                  Process
                  <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-[#B87333] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
                <Link
                  href="/#about"
                  className="relative px-4 py-2 text-sm font-medium text-[#2C2C2C]/70 hover:text-[#2C2C2C] transition-colors rounded-lg group"
                >
                  About
                  <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-[#B87333] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
                <Link
                  href="/#contact"
                  className="relative px-4 py-2 text-sm font-medium text-[#2C2C2C]/70 hover:text-[#2C2C2C] transition-colors rounded-lg group"
                >
                  Contact
                  <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-[#B87333] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              </>
            )}

            {/* Divider */}
            <div className="w-px h-6 bg-[#C5AA7D]/30 mx-2" />

            <Link
              href="/geo-audit"
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg flex items-center gap-2 ${
                isGeoAuditPage
                  ? "text-[#B87333] bg-[#B87333]/10"
                  : "text-[#B87333] hover:bg-[#B87333]/10 hover:shadow-[0_0_15px_rgba(184,115,51,0.2)]"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              GEO Tool
            </Link>

            {/* Auth Button */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-2">
                <span className="text-sm text-[#2C2C2C]/60 hidden lg:block">{userEmail}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-[#C5AA7D]/30 text-[#2C2C2C]/70 hover:bg-[#C5AA7D]/10 hover:text-[#2C2C2C] transition-all duration-300 bg-transparent"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button
                  size="sm"
                  className="ml-2 bg-[#B87333] hover:bg-[#A66329] text-white hover:shadow-[0_0_15px_rgba(184,115,51,0.3)] transition-all duration-300"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-[#2C2C2C] hover:bg-[#C5AA7D]/10 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#FAF8F5] border-t border-[#C5AA7D]/20">
          <div className="px-4 py-4 space-y-2">
            {isMainPage ? (
              <>
                <a
                  href="#solutions"
                  className="block px-4 py-3 text-[#2C2C2C]/70 hover:text-[#2C2C2C] hover:bg-[#C5AA7D]/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Solutions
                </a>
                <a
                  href="#process"
                  className="block px-4 py-3 text-[#2C2C2C]/70 hover:text-[#2C2C2C] hover:bg-[#C5AA7D]/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Process
                </a>
                <a
                  href="#about"
                  className="block px-4 py-3 text-[#2C2C2C]/70 hover:text-[#2C2C2C] hover:bg-[#C5AA7D]/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </a>
                <a
                  href="#contact"
                  className="block px-4 py-3 text-[#2C2C2C]/70 hover:text-[#2C2C2C] hover:bg-[#C5AA7D]/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </a>
              </>
            ) : (
              <>
                <Link
                  href="/#solutions"
                  className="block px-4 py-3 text-[#2C2C2C]/70 hover:text-[#2C2C2C] hover:bg-[#C5AA7D]/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Solutions
                </Link>
                <Link
                  href="/#process"
                  className="block px-4 py-3 text-[#2C2C2C]/70 hover:text-[#2C2C2C] hover:bg-[#C5AA7D]/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Process
                </Link>
                <Link
                  href="/#about"
                  className="block px-4 py-3 text-[#2C2C2C]/70 hover:text-[#2C2C2C] hover:bg-[#C5AA7D]/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/#contact"
                  className="block px-4 py-3 text-[#2C2C2C]/70 hover:text-[#2C2C2C] hover:bg-[#C5AA7D]/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
              </>
            )}

            <div className="border-t border-[#C5AA7D]/20 my-2" />

            <Link
              href="/geo-audit"
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                isGeoAuditPage ? "text-[#B87333] bg-[#B87333]/10" : "text-[#B87333] hover:bg-[#B87333]/10"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <BarChart3 className="w-5 h-5" />
              GEO Visibility Tool
            </Link>

            <div className="border-t border-[#C5AA7D]/20 my-2" />

            {isAuthenticated ? (
              <div className="space-y-2">
                <p className="px-4 py-2 text-sm text-[#2C2C2C]/60">Signed in as {userEmail}</p>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-[#2C2C2C]/70 hover:text-[#2C2C2C] hover:bg-[#C5AA7D]/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="block" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-[#B87333] hover:bg-[#A66329] text-white">Login</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
