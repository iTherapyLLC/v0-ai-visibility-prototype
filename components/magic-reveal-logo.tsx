"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"

interface MagicRevealLogoProps {
  src: string
  alt: string
}

export function MagicRevealLogo({ src, alt }: MagicRevealLogoProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])
  const [glowIntensity, setGlowIntensity] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const nextIdRef = useRef(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setMousePos({ x, y })
    setGlowIntensity(1)

    // Create particle at mouse position
    const newParticle = {
      id: nextIdRef.current++,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      delay: 0,
    }
    setParticles((prev) => [...prev, newParticle])

    // Remove particle after animation
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id))
    }, 2000)
  }

  useEffect(() => {
    if (!isHovering) {
      const timeout = setTimeout(() => setGlowIntensity(0), 300)
      return () => clearTimeout(timeout)
    }
  }, [isHovering])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="relative aspect-square bg-[#FAF8F5] rounded-2xl overflow-hidden shadow-xl cursor-pointer group"
    >
      {/* Animated gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#B87333]/10 to-transparent transition-all duration-500"
        style={{
          opacity: isHovering ? 1 : 0.3,
          transform: `translate(${(mousePos.x - 50) * 0.1}px, ${(mousePos.y - 50) * 0.1}px)`,
        }}
      />

      {/* Dynamic radial glow that follows cursor */}
      {isHovering && (
        <div
          className="absolute w-64 h-64 pointer-events-none transition-opacity duration-300"
          style={{
            left: `${mousePos.x}%`,
            top: `${mousePos.y}%`,
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, rgba(184, 115, 51, ${glowIntensity * 0.4}) 0%, transparent 70%)`,
            opacity: glowIntensity,
          }}
        />
      )}

      {/* Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full pointer-events-none animate-particle"
          style={{
            left: particle.x,
            top: particle.y,
            background: "radial-gradient(circle, #B87333, transparent)",
            animation: "particle-float 2s ease-out forwards",
          }}
        />
      ))}

      {/* Logo with reveal effect */}
      <div className="absolute inset-0 flex items-center justify-center bg-[#FAF8F5] p-12">
        <div
          className="relative w-full h-full transition-all duration-500"
          style={{
            transform: isHovering ? "scale(1.05) rotate(2deg)" : "scale(1) rotate(0deg)",
            filter: isHovering
              ? `drop-shadow(0 0 20px rgba(184, 115, 51, 0.6)) brightness(1.1)`
              : "drop-shadow(0 0 10px rgba(184, 115, 51, 0.2)) brightness(1)",
          }}
        >
          <Image
            src={src || "/placeholder.svg"}
            alt={alt}
            fill
            className="object-contain opacity-40 group-hover:opacity-70 transition-all duration-500"
          />
        </div>
      </div>

      {/* Grid overlay for "data" effect */}
      {isHovering && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{
            background: `
              repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(184, 115, 51, 0.08) 19px, rgba(184, 115, 51, 0.08) 20px),
              repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(184, 115, 51, 0.08) 19px, rgba(184, 115, 51, 0.08) 20px)
            `,
            opacity: 0.5,
          }}
        />
      )}

      {/* Corner accents that appear on hover */}
      <div
        className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#B87333] transition-all duration-300"
        style={{
          opacity: isHovering ? 1 : 0,
          transform: isHovering ? "translate(0, 0)" : "translate(8px, 8px)",
        }}
      />
      <div
        className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#B87333] transition-all duration-300"
        style={{
          opacity: isHovering ? 1 : 0,
          transform: isHovering ? "translate(0, 0)" : "translate(-8px, 8px)",
        }}
      />
      <div
        className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#B87333] transition-all duration-300"
        style={{
          opacity: isHovering ? 1 : 0,
          transform: isHovering ? "translate(0, 0)" : "translate(8px, -8px)",
        }}
      />
      <div
        className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#B87333] transition-all duration-300"
        style={{
          opacity: isHovering ? 1 : 0,
          transform: isHovering ? "translate(0, 0)" : "translate(-8px, -8px)",
        }}
      />
    </div>
  )
}
