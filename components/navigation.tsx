"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

export function Navigation() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(path)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 py-4">
          {/* Logo - Icon with text */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="rounded-full border-2 border-muted p-2 bg-white">
              <Image
                src="/images/featherstone-logo.png"
                alt="Featherstone Intelligence"
                width={40}
                height={40}
                priority
                className="h-10 w-10 object-contain"
              />
            </div>
            <span className="font-serif text-xl font-semibold text-foreground tracking-wide hidden sm:block">
              Featherstone Intelligence
            </span>
          </Link>

          {/* Navigation Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors relative group ${
                isActive("/") && pathname === "/" ? "text-foreground" : "text-foreground/70"
              }`}
            >
              Demo
              <span
                className={`absolute -bottom-1 left-0 right-0 h-0.5 bg-accent transition-transform origin-left ${
                  isActive("/") && pathname === "/" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
            <Link
              href="/methodology"
              className={`text-sm font-medium transition-colors relative group ${
                isActive("/methodology") ? "text-foreground" : "text-foreground/70"
              }`}
            >
              Methodology
              <span
                className={`absolute -bottom-1 left-0 right-0 h-0.5 bg-accent transition-transform origin-left ${
                  isActive("/methodology") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium transition-colors relative group ${
                isActive("/contact") ? "text-foreground" : "text-foreground/70"
              }`}
            >
              Contact
              <span
                className={`absolute -bottom-1 left-0 right-0 h-0.5 bg-accent transition-transform origin-left ${
                  isActive("/contact") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
