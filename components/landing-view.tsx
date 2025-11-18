"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navigation } from "@/components/navigation" // Import Navigation component
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { WinerySpecialty } from "@/lib/prompts"

interface LandingViewProps {
  onAuditComplete: (auditId: string, url: string) => void
}

export function LandingView({ onAuditComplete }: LandingViewProps) {
  const [url, setUrl] = useState("")
  const [scrollY, setScrollY] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [specialty, setSpecialty] = useState<WinerySpecialty>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      console.log("[v0] Submitting audit for URL:", url)

      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), specialty }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to start audit")
      }

      const data = await response.json()
      console.log("[v0] Audit created successfully:", data)
      console.log("[v0] Full auditId received:", data.auditId)
      console.log("[v0] AuditId length:", data.auditId?.length)
      console.log("[v0] AuditId type:", typeof data.auditId)

      const processUrl = `/api/process-audit/${data.auditId}`
      console.log("[v0] Calling process endpoint with URL:", processUrl)
      console.log("[v0] Process URL length:", processUrl.length)

      fetch(processUrl).catch((err) => {
        console.error("[v0] Error triggering audit processing:", err)
      })

      setTimeout(() => {
        console.log("[v0] Passing auditId to dashboard:", data.auditId)
        onAuditComplete(data.auditId, url)
      }, 3000)
    } catch (err) {
      console.error("[v0] Error starting audit:", err)
      setError(err instanceof Error ? err.message : "Failed to start audit. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Navigation />

      <div className="absolute inset-0 z-0">
        <img
          src="/muted-desaturated-vineyard-landscape-rolling-hills.jpg"
          alt="Vineyard landscape"
          className="w-full h-full object-cover"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
            filter: "blur(1px) saturate(0.7)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAF8]/40 via-[#FAFAF8]/50 to-[#FAFAF8]/60" />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-30">
        <div className="text-center space-y-8">
          <div className="space-y-2 animate-fade-in">
            <p className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
              Featherstone Intelligence
            </p>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground text-balance leading-tight">AI Visibility</h1>
          </div>

          <div className="space-y-4 max-w-xl mx-auto animate-fade-in-delay-1">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground text-balance">
              See how AI already talks about your brand.
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto animate-fade-in-delay-2">
            <div className="space-y-3 text-left">
              <Label htmlFor="website-url" className="text-base font-medium text-foreground">
                Enter your website URL
              </Label>
              <Input
                id="website-url"
                type="url"
                placeholder="https://examplewinery.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-12 text-base bg-card border-border focus:border-primary"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-3 text-left">
              <Label className="text-base font-medium text-foreground">
                What's your winery's primary focus? <span className="text-muted-foreground text-sm">(optional)</span>
              </Label>
              <RadioGroup value={specialty ?? ''} onValueChange={(v) => setSpecialty(v as WinerySpecialty || null)} disabled={isSubmitting}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cabernet" id="cabernet" />
                    <Label htmlFor="cabernet" className="font-normal cursor-pointer">Cabernet Sauvignon</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="chardonnay" id="chardonnay" />
                    <Label htmlFor="chardonnay" className="font-normal cursor-pointer">Chardonnay</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pinot" id="pinot" />
                    <Label htmlFor="pinot" className="font-normal cursor-pointer">Pinot Noir</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sparkling" id="sparkling" />
                    <Label htmlFor="sparkling" className="font-normal cursor-pointer">Sparkling Wines</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="multiple" id="multiple" />
                    <Label htmlFor="multiple" className="font-normal cursor-pointer">Multiple Varietals</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="" id="other" />
                    <Label htmlFor="other" className="font-normal cursor-pointer">Other/Not Sure (use default prompts)</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Starting Audit..." : "Run AI Visibility Audit"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
