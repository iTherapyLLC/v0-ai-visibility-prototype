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
        <div className="min-h-screen pt-20 relative overflow-hidden bg-gradient-to-br from-[#30594B] via-[#3d6658] to-[#C5AA7D]">
          {/* Wine country pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23FAFAF8' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          {/* Floating decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-10 w-32 h-32 bg-[#FAFAF8]/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-1/4 right-10 w-40 h-40 bg-[#FAFAF8]/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          </div>

          <div className="relative flex items-center justify-center px-6" style={{ minHeight: 'calc(100vh - 5rem)' }}>
            <div className="text-center space-y-12 max-w-3xl">
              
              {/* Logo section */}
              <div className="space-y-6">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-[#FAFAF8]/10 rounded-full blur-2xl" />
                  <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto">
                    <div 
                      className="w-full h-full"
                      style={{ 
                        animation: 'spin 4s ease-in-out infinite',
                      }}
                    >
                      <Image
                        src="/images/featherstone-logo.png"
                        alt="Featherstone Intelligence"
                        width={128}
                        height={128}
                        className="w-full h-full object-contain drop-shadow-2xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl md:text-5xl font-serif font-semibold text-[#FAFAF8] tracking-wide leading-tight">
                    Analyzing Your<br />AI Visibility
                  </h2>
                  
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#C5AA7D] to-transparent" />
                    <div className="w-2 h-2 rounded-full bg-[#C5AA7D]" />
                    <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#C5AA7D] to-transparent" />
                  </div>

                  <p className="text-[#FAFAF8]/80 text-lg font-light">
                    Evaluating how AI assistants discover and recommend your winery
                  </p>
                </div>
              </div>

              {/* Animated loader */}
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-2.5 h-2.5 bg-[#C5AA7D] rounded-full animate-bounce"
                      style={{ 
                        animationDelay: `${i * 150}ms`, 
                        animationDuration: '1.2s' 
                      }}
                    />
                  ))}
                </div>
                <p className="text-[#FAFAF8]/70 text-base font-light italic">
                  Preparing your visibility assessment...
                </p>
              </div>

            </div>
          </div>

          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
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
