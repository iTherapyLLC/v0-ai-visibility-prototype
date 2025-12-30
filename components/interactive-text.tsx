"use client"

import { useState, useRef, useCallback } from "react"

interface InteractiveTextProps {
  children: string
  className?: string
  glowColor?: string
  as?: "h1" | "h2" | "h3" | "span" | "p"
}

export function InteractiveText({
  children,
  className = "",
  glowColor = "#B87333",
  as: Component = "span",
}: InteractiveTextProps) {
  const [activeIndices, setActiveIndices] = useState<Set<number>>(new Set())
  const [trailIndices, setTrailIndices] = useState<Map<number, number>>(new Map())
  const containerRef = useRef<HTMLElement>(null)
  const timeoutRefs = useRef<Map<number, NodeJS.Timeout>>(new Map())

  const handleCharHover = useCallback((index: number) => {
    // Clear any existing timeout for this index
    const existingTimeout = timeoutRefs.current.get(index)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Add to active indices
    setActiveIndices((prev) => new Set([...prev, index]))

    // Set trail intensity (starts at 1, fades)
    setTrailIndices((prev) => new Map(prev).set(index, 1))

    // Create fading trail effect
    const fadeSteps = [0.8, 0.6, 0.4, 0.2, 0]
    fadeSteps.forEach((intensity, stepIndex) => {
      const timeout = setTimeout(
        () => {
          if (intensity === 0) {
            setActiveIndices((prev) => {
              const next = new Set(prev)
              next.delete(index)
              return next
            })
            setTrailIndices((prev) => {
              const next = new Map(prev)
              next.delete(index)
              return next
            })
          } else {
            setTrailIndices((prev) => new Map(prev).set(index, intensity))
          }
        },
        150 * (stepIndex + 1),
      )

      if (stepIndex === fadeSteps.length - 1) {
        timeoutRefs.current.set(index, timeout)
      }
    })
  }, [])

  const characters = children.split("")

  return (
    <Component ref={containerRef as any} className={`${className} cursor-default select-none`}>
      {characters.map((char, index) => {
        const isActive = activeIndices.has(index)
        const trailIntensity = trailIndices.get(index) || 0

        return (
          <span
            key={index}
            onMouseEnter={() => handleCharHover(index)}
            className="relative inline-block transition-all duration-150"
            style={{
              color: isActive || trailIntensity > 0 ? glowColor : "inherit",
              textShadow:
                isActive || trailIntensity > 0
                  ? `0 0 ${10 * trailIntensity}px ${glowColor}, 0 0 ${20 * trailIntensity}px ${glowColor}, 0 0 ${30 * trailIntensity}px ${glowColor}40`
                  : "none",
              transform: isActive ? "translateY(-2px)" : "translateY(0)",
              filter: isActive ? `brightness(1.2)` : "brightness(1)",
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        )
      })}
    </Component>
  )
}
