"use client"

import { useState } from "react"
import Image from "next/image"
import { LandingView } from "@/components/landing-view"
import { DashboardView } from "@/components/dashboard-view"

export default function Home() {
  const [view, setView] = useState<"landing" | "loading" | "dashboard">("landing")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [auditId, setAuditId] = useState("")

  const handleAuditComplete = (id: string, url: string) => {
    console.log("[Page] handleAuditComplete called with id:", id, "url:", url)

    setAuditId(id)
    setWebsiteUrl(url)
    setView("loading")

    console.log("[Page] State updated - auditId:", id, "websiteUrl:", url)

    // Show loading animation for 3 seconds
    setTimeout(() => {
      console.log("[Page] Switching to dashboard view")
      setView("dashboard")
    }, 3000)
  }

  const handleBack = () => {
    console.log("[Page] Returning to landing view")
    setView("landing")
    setWebsiteUrl("")
    setAuditId("")
  }

  return (
    <>
      {view === "landing" && <LandingView onAuditComplete={handleAuditComplete} />}
      {view === "loading" && (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="text-center space-y-6">
            <div className="relative w-32 h-32 mx-auto animate-spin" style={{ animationDuration: "3s" }}>
              <Image
                src="/images/featherstone-logo.png"
                alt="Featherstone Intelligence"
                width={128}
                height={128}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-semibold text-foreground">ANALYZING AI VISIBILITY...</h2>
              <p className="text-muted-foreground">Scanning ChatGPT, Perplexity, and Gemini</p>
            </div>
          </div>
        </div>
      )}
      {view === "dashboard" && (
        <>
          {console.log("[Page] Rendering dashboard with auditId:", auditId, "websiteUrl:", websiteUrl)}
          <DashboardView auditId={auditId} websiteUrl={websiteUrl} onBack={handleBack} />
        </>
      )}
    </>
  )
}
