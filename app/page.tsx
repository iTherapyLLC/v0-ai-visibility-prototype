"use client"

import { useState } from "react"
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
            <img
              src="/images/featherstone-logo.png"
              alt="Featherstone Intelligence"
              style={{
                width: "128px",
                height: "auto",
                margin: "0 auto",
                marginBottom: "6rem", // Increased from 4.25rem to 6rem to lower text and prevent interference with animation
                display: "block",
                animation: "spin 3s linear infinite",
              }}
            />
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">Analyzing AI Visibility…</h2>
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
