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
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#FAFAF8] via-[#F5F3EF] to-[#EDE9E3]">
          {/* Subtle decorative elements */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute top-20 left-10 w-64 h-64 bg-[#30594B] rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#C5AA7D] rounded-full blur-3xl" />
          </div>

          <div className="relative min-h-screen flex items-center justify-center px-6">
            <div className="text-center space-y-8 max-w-2xl">
              {/* Logo with elegant animation */}
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-[#30594B]/5 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-32 h-32 mx-auto animate-spin" style={{ animationDuration: "3s" }}>
                  <Image
                    src="/images/featherstone-logo.png"
                    alt="Featherstone Intelligence"
                    width={128}
                    height={128}
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>
              </div>

              {/* Main heading with wine country typography */}
              <div className="space-y-3">
                <h2 className="text-3xl md:text-4xl font-serif font-semibold text-[#30594B] tracking-wide">
                  ANALYZING AI VISIBILITY
                </h2>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#C5AA7D]" />
                  <p className="text-base text-[#30594B]/70 font-medium">Scanning AI Platforms</p>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#C5AA7D]" />
                </div>
              </div>

              {/* Platform badges */}
              <div className="flex items-center justify-center gap-4 flex-wrap">
                {["ChatGPT", "Perplexity", "Gemini"].map((platform, index) => (
                  <div
                    key={platform}
                    className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-[#30594B]/10 rounded-full shadow-sm animate-fade-in"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <span className="text-sm font-medium text-[#30594B]">{platform}</span>
                  </div>
                ))}
              </div>

              {/* Subtle progress indicator */}
              <div className="pt-4">
                <div className="flex items-center justify-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-[#C5AA7D] rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 150}ms`, animationDuration: "1s" }}
                    />
                  ))}
                </div>
                <p className="text-sm text-[#30594B]/60 mt-4 italic">
                  Evaluating your presence across AI assistants...
                </p>
              </div>
            </div>
          </div>

          <style jsx>{`
            @keyframes fade-in {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .animate-fade-in {
              animation: fade-in 0.6s ease-out forwards;
              opacity: 0;
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
