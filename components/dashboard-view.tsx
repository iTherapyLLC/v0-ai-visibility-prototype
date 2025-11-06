"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect, useRef } from "react"
import {
  CheckCircle2,
  XCircle,
  TrendingUp,
  Target,
  Lightbulb,
  Award,
  MapPin,
  Heart,
  Repeat,
  RefreshCw,
} from "lucide-react"

interface DashboardViewProps {
  auditId: string
  websiteUrl: string
  onBack: () => void
}

export function DashboardView({ auditId, websiteUrl, onBack }: DashboardViewProps) {
  console.log("[Dashboard] Mounted with auditId:", auditId, "url:", websiteUrl)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const [error, setError] = useState<string | null>(null)
  const [audit, setAudit] = useState<any>(null)
  const [job, setJob] = useState<any>(null)
  const [competitorData, setCompetitorData] = useState<any>({
    topCompetitors: [],
    citationOpportunities: [],
    quickWins: [],
  })
  const [timedOut, setTimedOut] = useState(false)
  const [pollingTrigger, setPollingTrigger] = useState(0)

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSections((prev) => new Set(prev).add(entry.target.id))
        }
      })
    },
    { threshold: 0.1 },
  )

  useEffect(() => {
    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let attempts = 0
    let timer: any

    const tick = async () => {
      attempts += 1

      const [aRes, jRes] = await Promise.all([
        fetch(`/api/audit/${auditId}`, { cache: "no-store" }),
        fetch(`/api/job-status/${auditId}`, { cache: "no-store" }),
      ])
      const a = await aRes.json()
      const j = await jRes.json()
      setAudit(a?.audit ?? a)
      setJob(j)

      // 👇 hard stop on completed/failed
      if (
        a?.audit?.status === "completed" ||
        a?.audit?.status === "failed" ||
        a?.status === "completed" ||
        a?.status === "failed"
      ) {
        return
      }

      if (attempts < 60) {
        timer = setTimeout(tick, 3000)
      } else {
        // one last fresh fetch before timeout UI
        const final = await fetch(`/api/audit/${auditId}`, { cache: "no-store" }).then((r) => r.json())
        setAudit(final?.audit ?? final)
        // if truly completed, render; else show refresh button
        if (final?.audit?.status !== "completed" && final?.status !== "completed") {
          setTimedOut(true)
        }
      }
    }

    tick()
    return () => clearTimeout(timer)
  }, [auditId, pollingTrigger])

  useEffect(() => {
    if (job?.status === "queued") {
      const timer = setTimeout(() => {
        console.log("[Dashboard] Job still queued after 10s, retriggering process-audit endpoint")
        fetch(`/api/process-audit/${auditId}`, { cache: "no-store" })
          .then(() => console.log("[Dashboard] Retrigger successful"))
          .catch((err) => console.error("[Dashboard] Retrigger failed:", err))
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [job?.status, auditId])

  const handleRefreshResults = () => {
    console.log("[Dashboard] Restarting polling")
    setTimedOut(false)
    setError(null)
    setPollingTrigger((prev) => prev + 1) // Trigger polling useEffect to re-run
  }

  useEffect(() => {
    const fetchCompetitorData = async () => {
      try {
        const response = await fetch(`/api/competitors?url=${encodeURIComponent(websiteUrl)}`, { cache: "no-store" })

        if (!response.ok) {
          console.log("[v0] Competitor API not available, using empty state")
          setCompetitorData({
            topCompetitors: [],
            citationOpportunities: [],
            quickWins: [],
          })
          return
        }

        const data = await response.json()
        setCompetitorData(data)
      } catch (err) {
        console.log("[v0] Competitor data unavailable, displaying empty state")
        setCompetitorData({
          topCompetitors: [],
          citationOpportunities: [],
          quickWins: [],
        })
      }
    }

    if (websiteUrl) {
      fetchCompetitorData()
    }
  }, [websiteUrl])

  const scrollToRecommendations = () => {
    const element = document.getElementById("recommendations")
    element?.scrollIntoView({ behavior: "smooth" })
  }

  const auditStatus = audit?.status
  const jobStatus = job?.status

  // 🚦 If timed out, show refresh button
  if (timedOut) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">Audit is taking longer than expected</p>
            <p className="text-sm text-gray-600">
              The processing may still be running in the background. Click refresh to check if it's completed.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleRefreshResults} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh Results
            </Button>
            <Button onClick={onBack} variant="outline">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // 🚦 If the audit is completed, render results immediately
  if (auditStatus === "completed") {
    const overallScore = audit.overallScore ?? 0
    const citationCount = audit.citationCount ?? 0
    const promptResults = audit.promptResults || { totalPrompts: 0, mentionedIn: 0, prompts: [] }
    const totalPrompts = promptResults.totalPrompts || 0
    const mentionedIn = promptResults.mentionedIn || 0
    const prompts = promptResults.prompts || []
    const mentionRate = totalPrompts > 0 ? ((mentionedIn / totalPrompts) * 100).toFixed(0) : "0"

    const dimensionScores = audit.dimensionScores || {
      citationPresence: 0,
      position: 0,
      sentiment: 0,
      frequency: 0,
    }

    const getStatusBadge = (score: number) => {
      if (score >= 71) {
        return { label: "Excellent", variant: "default" as const, color: "bg-green-500" }
      } else if (score >= 41) {
        return { label: "Good", variant: "secondary" as const, color: "bg-yellow-500" }
      } else {
        return { label: "Needs Improvement", variant: "destructive" as const, color: "bg-red-500" }
      }
    }

    const statusBadge = getStatusBadge(overallScore)

    const defaultRecommendations = [
      {
        title: "Claim Your Business Listings",
        description: "Ensure your business is claimed on Google My Business, Yelp, and other major platforms.",
        priority: "high",
      },
      {
        title: "Enhance Website Content",
        description:
          "Add detailed descriptions about your winery, including history, wine varieties, and unique features.",
        priority: "high",
      },
      {
        title: "Encourage Customer Reviews",
        description:
          "Request reviews from satisfied customers on multiple platforms to build credibility and visibility.",
        priority: "medium",
      },
      {
        title: "Ensure NAP Consistency",
        description: "Make sure your Name, Address, and Phone number are consistent across all online platforms.",
        priority: "medium",
      },
      {
        title: "Create Quality Content",
        description: "Publish blog posts, wine guides, and event information to establish authority in your niche.",
        priority: "low",
      },
    ]

    const recommendations = audit.recommendations?.length > 0 ? audit.recommendations : defaultRecommendations

    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif text-[#30594B]">AI Visibility Report</h1>
              <p className="text-sm text-gray-600 mt-1">{websiteUrl}</p>
            </div>
            <Button onClick={onBack} variant="outline">
              New Audit
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
          {/* Hero Section - Overall Score */}
          <section className="text-center space-y-6">
            <div className="inline-flex items-center gap-3">
              <h2 className="text-4xl font-serif text-[#30594B]">Overall AI Visibility Score</h2>
              <Badge variant={statusBadge.variant} className="text-sm px-3 py-1">
                {statusBadge.label}
              </Badge>
            </div>

            <div className="relative inline-block">
              <div className="text-8xl font-bold text-[#30594B]">
                {overallScore}
                <span className="text-5xl text-gray-400"> / 100</span>
              </div>
              <div className={`absolute -bottom-2 left-0 right-0 h-2 ${statusBadge.color} rounded-full`} />
            </div>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your winery appears in <span className="font-semibold text-[#30594B]">{mentionedIn}</span> of{" "}
              <span className="font-semibold text-[#30594B]">{totalPrompts}</span> tested AI prompts
            </p>
          </section>

          {/* Key Metrics Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Total Citations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-[#30594B]">{citationCount}</div>
                <p className="text-sm text-gray-500 mt-1">Times mentioned by AI</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Prompts Tested
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-[#30594B]">{totalPrompts}</div>
                <p className="text-sm text-gray-500 mt-1">AI queries analyzed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Mention Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-[#30594B]">{mentionRate}%</div>
                <p className="text-sm text-gray-500 mt-1">Visibility percentage</p>
              </CardContent>
            </Card>
          </section>

          {/* GEO Dimension Scores Section */}
          <section className="space-y-6">
            <div>
              <h3 className="text-2xl font-serif text-[#30594B] mb-2">GEO Visibility Breakdown</h3>
              <p className="text-gray-600">
                Your AI visibility score across four key dimensions that determine how AI assistants recommend your
                business
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Citation Presence */}
              <Card className="border-l-4 border-l-[#30594B]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#30594B]/10 rounded-lg">
                        <Award className="w-5 h-5 text-[#30594B]" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-medium text-[#30594B]">Citation Presence</CardTitle>
                        <p className="text-sm text-gray-500">How you're mentioned</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-[#30594B]">{dimensionScores.citationPresence}/25</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={(dimensionScores.citationPresence / 25) * 100} className="h-3" />
                  <p className="text-sm text-gray-600 mt-3">
                    {dimensionScores.citationPresence >= 20
                      ? "Excellent - You're mentioned by name consistently"
                      : dimensionScores.citationPresence >= 10
                        ? "Good - You're mentioned, but often by category"
                        : "Needs work - Rarely mentioned by name"}
                  </p>
                </CardContent>
              </Card>

              {/* Position Weight */}
              <Card className="border-l-4 border-l-[#C5AA7D]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#C5AA7D]/10 rounded-lg">
                        <MapPin className="w-5 h-5 text-[#C5AA7D]" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-medium text-[#30594B]">Position Weight</CardTitle>
                        <p className="text-sm text-gray-500">Where you appear in lists</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-[#30594B]">{dimensionScores.position}/35</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={(dimensionScores.position / 35) * 100} className="h-3" />
                  <p className="text-sm text-gray-600 mt-3">
                    {dimensionScores.position >= 30
                      ? "Excellent - Often recommended first"
                      : dimensionScores.position >= 15
                        ? "Good - Appearing in top recommendations"
                        : "Needs work - Rarely in top positions"}
                  </p>
                </CardContent>
              </Card>

              {/* Sentiment */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <Heart className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-medium text-[#30594B]">Sentiment</CardTitle>
                        <p className="text-sm text-gray-500">How you're recommended</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-[#30594B]">{dimensionScores.sentiment}/25</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={(dimensionScores.sentiment / 25) * 100} className="h-3" />
                  <p className="text-sm text-gray-600 mt-3">
                    {dimensionScores.sentiment >= 20
                      ? "Excellent - Positive recommendations"
                      : dimensionScores.sentiment >= 10
                        ? "Good - Neutral mentions"
                        : "Needs work - Limited positive sentiment"}
                  </p>
                </CardContent>
              </Card>

              {/* Frequency */}
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Repeat className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-medium text-[#30594B]">Frequency</CardTitle>
                        <p className="text-sm text-gray-500">How often you're mentioned</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-[#30594B]">{dimensionScores.frequency}/15</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={(dimensionScores.frequency / 15) * 100} className="h-3" />
                  <p className="text-sm text-gray-600 mt-3">
                    {dimensionScores.frequency >= 12
                      ? "Excellent - Mentioned multiple times"
                      : dimensionScores.frequency >= 6
                        ? "Good - Consistent single mentions"
                        : "Needs work - Infrequent mentions"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Visibility Breakdown */}
          <section className="space-y-6">
            <div>
              <h3 className="text-2xl font-serif text-[#30594B] mb-2">AI Prompt Results</h3>
              <p className="text-gray-600">Detailed breakdown of how AI assistants responded to relevant queries</p>
            </div>

            <div className="space-y-4">
              {prompts.length > 0 ? (
                prompts.map((prompt: any, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-base font-medium text-gray-900 mb-2">"{prompt.prompt}"</CardTitle>
                          <div className="flex items-center gap-2">
                            {prompt.mentioned ? (
                              <>
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-medium text-green-600">Mentioned</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5 text-red-600" />
                                <span className="text-sm font-medium text-red-600">Not Mentioned</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    {prompt.mentioned && prompt.response && (
                      <CardContent>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <p className="text-sm text-gray-700 italic">"{prompt.response}"</p>
                          <p className="text-xs text-gray-500 mt-2">— AI Response Excerpt</p>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">No prompt results available</CardContent>
                </Card>
              )}
            </div>
          </section>

          {/* What This Means */}
          <section className="space-y-6">
            <div>
              <h3 className="text-2xl font-serif text-[#30594B] mb-2">What This Means</h3>
            </div>

            <Card className="border-l-4 border-l-[#C5AA7D]">
              <CardContent className="pt-6">
                {overallScore === 0 ? (
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      <span className="font-semibold text-[#30594B]">
                        AI assistants are not recommending your winery
                      </span>{" "}
                      when asked relevant questions. This means potential customers using ChatGPT, Claude, Perplexity,
                      or similar AI tools won't discover your business through these increasingly popular channels.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      As more consumers rely on AI for recommendations, improving your AI visibility is becoming
                      critical for attracting new customers. The good news: there are proven strategies to increase your
                      presence in AI responses.
                    </p>
                  </div>
                ) : overallScore < 41 ? (
                  <p className="text-gray-700 leading-relaxed">
                    Your winery has <span className="font-semibold text-[#30594B]">limited visibility</span> in AI
                    assistant responses. While you're appearing in some queries, there's significant room for
                    improvement to capture more AI-driven traffic and recommendations.
                  </p>
                ) : overallScore < 71 ? (
                  <p className="text-gray-700 leading-relaxed">
                    Your winery has <span className="font-semibold text-[#30594B]">good visibility</span> in AI
                    assistant responses. You're being recommended for relevant queries, but there are still
                    opportunities to improve your presence and capture even more AI-driven traffic.
                  </p>
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    Excellent work! Your winery has{" "}
                    <span className="font-semibold text-[#30594B]">strong visibility</span> in AI assistant responses.
                    You're well-positioned to capture AI-driven traffic and recommendations. Continue maintaining your
                    online presence to sustain this advantage.
                  </p>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Recommendations */}
          <section id="recommendations" className="space-y-6">
            <div>
              <h3 className="text-2xl font-serif text-[#30594B] mb-2 flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-[#C5AA7D]" />
                How to Improve Your AI Visibility
              </h3>
              <p className="text-gray-600">Actionable steps to increase your presence in AI assistant responses</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((rec: any, index: number) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-lg font-medium text-[#30594B]">{rec.title}</CardTitle>
                      {rec.priority && (
                        <Badge
                          variant={
                            rec.priority === "high"
                              ? "destructive"
                              : rec.priority === "medium"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs"
                        >
                          {rec.priority}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm leading-relaxed">{rec.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center py-12 space-y-6">
            <div className="max-w-2xl mx-auto space-y-4">
              <h3 className="text-2xl font-serif text-[#30594B]">Ready to Improve Your AI Visibility?</h3>
              <p className="text-gray-600">
                Contact Featherstone Intelligence to develop a customized strategy for increasing your presence in AI
                assistant responses.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button size="lg" className="bg-[#30594B] hover:bg-[#30594B]/90">
                  Schedule Consultation
                </Button>
                <Button size="lg" variant="outline" onClick={onBack}>
                  Run Another Audit
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    )
  }

  // If the audit failed, show error
  if (auditStatus === "failed" || jobStatus === "failed") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">Audit failed</p>
            <p className="text-sm text-gray-600">
              {error || "An error occurred while processing your audit. Please try again."}
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleRefreshResults} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
            <Button onClick={onBack} variant="outline">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Otherwise keep showing progress
  const progress = job?.progress || 0
  const currentPrompt = job?.current_prompt || 0
  const totalPrompts = job?.total_prompts || 10

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-8">
        <img
          src="/images/featherstone-logo.png"
          alt="Featherstone Intelligence Loading"
          style={{
            width: "128px",
            height: "auto",
            margin: "0 auto 6rem",
            display: "block",
            animation: "spin 3s linear infinite",
          }}
          onError={(e) => {
            console.error("[v0] Logo image failed to load")
            e.currentTarget.style.display = "none"
          }}
        />
        <div className="space-y-4">
          <p className="text-xl font-medium text-foreground">ANALYZING AI VISIBILITY...</p>
          {job && job.status === "processing" && (
            <>
              <p className="text-sm text-muted-foreground">
                Testing prompt {currentPrompt} of {totalPrompts} ({progress}%)
              </p>
              <div className="w-64 mx-auto">
                <Progress value={progress} className="h-2" />
              </div>
            </>
          )}
          {(!job || job.status === "queued") && (
            <p className="text-sm text-muted-foreground">Scanning ChatGPT, Perplexity, and Gemini</p>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
