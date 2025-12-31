"use client"

import Link from "next/link"
import Image from "next/image"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#2C2C2C] border-t border-[#C4B39A]/20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo and tagline */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="rounded-full border border-[#C5AA7D]/30 p-1.5 bg-white shadow-sm">
                <Image
                  src="/images/featherstone-logo.png"
                  alt="Featherstone Intelligence"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              </div>
              <span className="font-serif text-lg font-semibold text-[#FAF8F5] tracking-wide">
                Featherstone Intelligence
              </span>
            </Link>
            <p className="text-[#FAF8F5]/60 text-sm leading-relaxed max-w-md">
              Invisible Intelligence. Unforgettable Hospitality. Helping premium wineries and hospitality brands thrive
              in the age of AI-driven discovery.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-[#C4B39A] font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#solutions" className="text-[#FAF8F5]/60 hover:text-[#FAF8F5] text-sm transition-colors">
                  Solutions
                </Link>
              </li>
              <li>
                <Link href="/#process" className="text-[#FAF8F5]/60 hover:text-[#FAF8F5] text-sm transition-colors">
                  Process
                </Link>
              </li>
              <li>
                <Link href="/#about" className="text-[#FAF8F5]/60 hover:text-[#FAF8F5] text-sm transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-[#FAF8F5]/60 hover:text-[#FAF8F5] text-sm transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-[#C4B39A] font-semibold text-sm uppercase tracking-wider mb-4">Tools</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/geo-audit" className="text-[#FAF8F5]/60 hover:text-[#FAF8F5] text-sm transition-colors">
                  GEO Visibility Tool
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-[#FAF8F5]/60 hover:text-[#FAF8F5] text-sm transition-colors">
                  Client Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#FAF8F5]/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[#FAF8F5]/40 text-sm">
              &copy; {currentYear} Featherstone Intelligence. All rights reserved.
            </p>
            <p className="text-[#FAF8F5]/40 text-sm">Napa Valley, California</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
