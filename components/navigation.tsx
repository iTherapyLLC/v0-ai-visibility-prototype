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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#C4B39A]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            onClick={handleLogoClick}
          >
            <div className="rounded-full border border-[#C4B39A]/30 p-1.5 bg-white shadow-sm">
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
            {/* Main page section links */}
            {isMainPage ? (
              <>
                <a
                  href="#solutions"
                  className="px-4 py-2 text-sm font-medium text-[#2C2C2C]/70 hover:text-[#2C2C2C] transition-colors rounded-lg hover:bg-[#C4B39A]/10"
                >
                  Solutions
                </a>
                <a
                  href="#process"
                  className="px-4 py-2 text-sm font-medium text-[#2C2C2C]/70 hover:text-[#2C2C2C] transition-colors rounded-lg hover:bg-[#C4B39A]/10"
                >
                  Process
                </a>
                <a
                  href="#about"
                  className="px-4 py-2 text-sm font-medium text-[#2C2C2C]/70 hover:text-[#2C2C2C] transition-colors rounded-lg hover:bg-[#C4B39A]/10"
                >
                  About
                </a>
                <a
                  href="#contact"
                  className="px-4 py-2 text-sm font-medium text-[#2C2C2C]/70 hover:text-[#2C2C2C] transition-colors rounded-lg hover:bg-[#C4B39A]/10"
                >
                  Contact
                </a>
              </>
            ) : (
              <>
                <Link
                  href="/#solutions"
                  className="px-4 py-2 text-sm font-medium text-[#2C2C2C]/70 hover:text-[#2C2C2C] transition-colors rounded-lg hover:bg-[#C4B39A]/10"
                >
                  Solutions
                </Link>
                <Link
                  href="/#process"
                  className="px-4 py-2 text-sm font-medium text-[#2C2C2C]/70 hover:text-[#2C2C2C] transition-colors rounded-lg hover:bg-[#C4B39A]/10"
                >
                  Process
                </Link>
                <Link
                  href="/#about"
                  className="px-4 py-2 text-sm font-medium text-[#2C2C2C]/70 hover:text-[#2C2C2C] transition-colors rounded-lg hover:bg-[#C4B39A]/10"
                >
                  About
                </Link>
                <Link
                  href="/#contact"
                  className="px-4 py-2 text-sm font-medium text-[#2C2C2C]/70 hover:text-[#2C2C2C] transition-colors rounded-lg hover:bg-[#C4B39A]/10"
                >
                  Contact
                </Link>
              </>
            )}

            {/* Divider */}
            <div className="w-px h-6 bg-[#C4B39A]/30 mx-2" />

            {/* GEO Tool Link */}
            <Link
              href="/geo-audit"
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg flex items-center gap-2 ${
                isGeoAuditPage
                  ? "text-[#B87333] bg-[#B87333]/10"
                  : "text-[#B87333] hover:bg-[#B87333]/10"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              GEO Tool
            </Link>

            {/* Auth Button */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-2">
                <span className="text-sm text-[#2C2C2C]/60 hidden lg:block">
                  {userEmail}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-[#C4B39A]/30 text-[#2C2C2C]/70 hover:bg-[#C4B39A]/10 hover:text-[#2C2C2C]"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button
                  size="sm"
                  className="ml-2 bg-[#B87333] hover:bg-[#A66329] text-white"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-[#2C2C2C] hover:bg-[#C4B39A]/10 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#FAF8F5] border-t border-[#C4B39A]/20">
          <div className="px-4 py-4 space-y-2">
            {isMainPage ? (
              <>
                <a
                  href="#solutions"
                  className="block px-4 py-3 text-[#2C2C2C]/70 hover:text-[#2C2C2C] hover:bg-[#C4B39A]/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Solutions
                </a>
                <a
                  href="#process"
                  className="block px-4 py-3 text-[#2C2C2C]/70 hover:text-[#2C2C2C] hover:bg-[#C4B39A]/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Process
                </a>
                <a
                  href="#about"
                  className="block px-4 py-3 text-[#2C2C2C]/70 hover:text-[#2C2C2C] hover:bg-[#C4B39A]/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </a>
                <a
                  href="#contact"
                  className="block px-4 py-3 text-[#2C2C2C]/70 hover:text-[#2C2C2C] hover:bg-[#C4B39A]/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </a>
              </>
            ) : (
              <>
                <Link
                  href="/#solutions"
                  className="block px-4 py-3 text-[#2C2C2C]/70 hover:text-[#2C2C2C] hover:bg-[#C4B39A]/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Solutions
                </Link>
                <Link
                  href="/#process"
                  className="block px-4 py-3 text-[#2C2C2C]/70 hover:text-[#2C2C2C] hover:bg-[#C4B39A]/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Process
                </Link>
                <Link
                  href="/#about"
                  className="block px-4 py-3 text-[#2C2C2C]/70 hover:text-[#2C2C2C] hover:bg-[#C4B39A]/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/#contact"
                  className="block px-4 py-3 text-[#2C2C2C]/70 hover:text-[#2C2C2C] hover:bg-[#C4B39A]/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
              </>
            )}

            <div className="border-t border-[#C4B39A]/20 my-2" />

            <Link
              href="/geo-audit"
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                isGeoAuditPage
                  ? "text-[#B87333] bg-[#B87333]/10"
                  : "text-[#B87333] hover:bg-[#B87333]/10"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <BarChart3 className="w-5 h-5" />
              GEO Visibility Tool
            </Link>

            <div className="border-t border-[#C4B39A]/20 my-2" />

            {isAuthenticated ? (
              <div className="space-y-2">
                <p className="px-4 py-2 text-sm text-[#2C2C2C]/60">
                  Signed in as {userEmail}
                </p>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-[#2C2C2C]/70 hover:text-[#2C2C2C] hover:bg-[#C4B39A]/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="block"
                onClick={() => setIsMenuOpen(false)}
              >
                <Button className="w-full bg-[#B87333] hover:bg-[#A66329] text-white">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
