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
    setTimedOut(true)
    setError(null)
    setTimeout(() => {
      setTimedOut(false)
      setPollingTrigger((p) => p + 1)
    }, 250)
  }

  useEffect(() => {
    const fetchCompetitorData = async () => {
      try {
        const response = await fetch(`/api/competitors?username=${encodeURIComponent(websiteUrl)}`, {
          cache: "no-store",
        })

        if (!response.ok) {
          console.log("[v0] Competitor API not available; using empty state")
          setCompetitorData({
            topCompetitors: [],
            citationOpportunities: [],
            quickWins: [],
          })
          return
        }

        const data = await response.json()
        setTimeout(() => setCompetitorData(data), 0)
      } catch {
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
              The processing may still be running in the background. Click refresh to check again.
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
    const overallScore = Number(audit?.overallScore ?? 0)
    const citationCount = Number(audit?.citationCount ?? 0)
    const promptResults = audit?.promptResults || { totalPrompts: 0, mentionedIn: 0, prompts: [] }
    const totalPrompts = Number(promptResults?.totalPrompts ?? 0)
    const mentionedIn = Number(promptResults?.mentionedIn ?? 0)
    const prompts = Array.isArray(promptResults?.prompts) ? promptResults?.prompts : []
    const mentionRate = totalPrompts > 0 ? ((mentionedIn / totalPrompts) * 100).toFixed(0) : "0"

    const dimensionScores = audit?.dimensionScores || {
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
        description: "Ensure your business is verified on Google, Yelp, TripAdvisor, and key wine directories.",
        priority: "high",
      },
      {
        title: "Enhance Website Content",
        description: "Add schema markup and publish FAQ + 'best of' content aligned to common AI queries.",
        priority: "high",
      },
      {
        title: "Encourage Reviews & PR",
        description: "Collect Google reviews, highlight awards, and secure mentions in trusted publications.",
        priority: "medium",
      },
      {
        title: "Ensure NAP Consistency",
        description: "Keep name, address, and phone number 100% consistent across all listings.",
        priority: "medium",
      },
      {
        title: "Build Authority Backlinks",
        description: "Partner with local guides, wine blogs, and tourism sites to earn reputable links.",
        priority: "low",
      },
    ]
    const recommendations =
      Array.isArray(audit?.reasons) && audit.reasons.length > 0 ? audit.reasons : defaultRecommendations

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
              <h2 className="text-4xl font-serif text-[#30594B]">
                Overall <span className="hidden sm:inline">AI Visibility</span> Score
              </h2>
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
              {/* Updated description to be more concise and accurate */}
              <p className="text-gray-600">
                How AI assistants mention, rank, describe, and repeatedly surface your brand.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Citation Presence */}
              <Card className="border-l-4 border-l-[#30594B]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#30594B]/10 rounded-lg">
                        <Award className="w-5 h-5 text-[#314d3f]" />
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
                  <Progress value={(dimensionScores.citationPresence / 25) * 100} className="h-2" />
                  <p className="text-sm text-gray-600 mt-3">
                    {dimensionScores.citationPresence >= 20
                      ? "Excellent – mentioned by name consistently"
                      : dimensionScores.citationPresence >= 10
                        ? "Good – mentioned indirectly or by category"
                        : "Needs work – rarely mentioned by name"}
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
                  <Progress value={(dimensionScores.position / 35) * 100} className="h-2" />
                  <p className="text-sm text-gray-600 mt-3">
                    {dimensionScores.position >= 30
                      ? "Excellent – often recommended first"
                      : dimensionScores.position >= 15
                        ? "Good – appearing in top recommendations"
                        : "Needs work – rarely at the top"}
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
                        <p className="text-sm text-gray-500">How you're described</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-[#30594B]">{dimensionScores.sentiment}/25</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={(dimensionScores.sentiment / 25) * 100} className="h-2" />
                  <p className="text-sm text-gray-600 mt-3">
                    {dimensionScores.sentiment >= 20
                      ? "Positive tone dominates"
                      : dimensionScores.sentiment >= 10
                        ? "Mostly neutral"
                        : "Needs work – limited positive signals"}
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
                        <p className="text-sm text-gray-500">How often you're in the mix</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-[#30594B]">{dimensionScores.frequency}/15</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={(dimensionScores.frequency / 15) * 100} className="h-2" />
                  <p className="text-sm text-gray-600 mt-3">
                    {dimensionScores.frequency >= 12
                      ? "Consistently surfaced"
                      : dimensionScores.frequency >= 6
                        ? "Intermittent"
                        : "Infrequent"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Visibility Breakdown */}
          <section className="space-y-6">
            <div>
              <h3 className="text-2xl font-serif text-[#30594B] mb-2">AI Prompt Results</h3>
              <p className="text-gray-600">How AI assistants answered the specific questions we asked.</p>
            </div>

            <div className="space-y-4">
              {Array.isArray(prompts) && prompts.length > 0 ? (
                prompts.map((prompt: any, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-base font-medium text-gray-900 mb-2">"{prompt?.prompt}"</CardTitle>
                          <div className="flex items-center gap-2">
                            {prompt?.analysis?.mentioned ? (
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
                    {prompt?.analysis?.mentioned && prompt?.response && (
                      <CardContent>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <p className="text-sm text-gray-700 italic">"{String(prompt.response).slice(0, 800)}"</p>
                          <p className="text-xs text-gray-500 mt-2">— AI response excerpt</p>
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
                      for the tested queries. Potential guests relying on AI tools likely won't discover your brand
                      organically.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      As discovery shifts from search engines to AI, improving your AI visibility becomes critical. The
                      good news: there is a clear, trackable path to raise these scores in 30–60 days.
                    </p>
                  </div>
                ) : overallScore < 41 ? (
                  <p className="text-gray-700 leading-relaxed">
                    You have <span className="font-semibold text-[#30594B]">limited visibility</span>. You appear for
                    some questions, but not consistently or prominently. We'll prioritize fixes that increase your named
                    mentions and move you up the list.
                  </p>
                ) : overallScore < 71 ? (
                  <p className="text-gray-700 leading-relaxed">
                    You have <span className="font-semibold text-[#30594B]">good visibility</span>. We'll focus on
                    pushing you toward #1–#3 positions and expanding coverage to more topics.
                  </p>
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    You have <span className="font-semibold text-[#30594B]">strong visibility</span>. The goal shifts to
                    maintaining prominence and defending against competitors.
                  </p>
                )}
              </CardContent>
            </Card>
          </section>

          <section id="ai-visibility-explanation" className="space-y-8">
            <div>
              <h3 className="text-2xl font-serif text-[#30594B] mb-2">Understanding Your AI Visibility Score</h3>
              <p className="text-gray-600 max-w-3xl">
                Your AI Visibility Score shows how easily AI assistants—like ChatGPT, Perplexity, and Gemini—can find,
                understand, and recommend your business. It's the next generation of SEO for AI-driven search.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-[#30594B]">
                <CardHeader>
                  <CardTitle className="text-lg text-[#30594B]">Citation Presence (0–25)</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-2">
                  <p>Measures how often AI mentions your business by name.</p>
                  <p>
                    <strong>Improve:</strong> add schema markup, ensure consistent NAP across directories, and earn
                    reputable backlinks/press mentions.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-[#C5AA7D]">
                <CardHeader>
                  <CardTitle className="text-lg text-[#30594B]">Position Weight (0–35)</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-2">
                  <p>Shows where you rank in AI recommendation lists.</p>
                  <p>
                    <strong>Improve:</strong> publish "best-of" and FAQ content aligned to common queries; get listed on
                    sources AI trusts (Yelp, TripAdvisor, Wine Enthusiast).
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-lg text-[#30594B]">Sentiment (0–25)</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-2">
                  <p>How positively AI describes your brand.</p>
                  <p>
                    <strong>Improve:</strong> drive reviews, highlight awards/testimonials, and surface positive press
                    on site pages AI crawls.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="text-lg text-[#30594B]">Frequency (0–15)</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-2">
                  <p>How consistently you appear across different AI questions.</p>
                  <p>
                    <strong>Improve:</strong> use a consistent brand name; keep Google Business, OpenTable, and Yelp
                    listings updated; expand relevant content.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-l-4 border-l-[#30594B]">
              <CardHeader>
                <CardTitle className="text-lg text-[#30594B]">Overall Score (0–100)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                Combines all four dimensions. 0–40 = rarely recommended, 41–70 = sometimes, 71+ = frequently and
                favorably recommended.
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="text-lg text-[#30594B]">What a Low Score Means</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                AI tools aren't confident enough to recommend your business for your category. You're more likely to be
                grouped as "generic" rather than a standout destination. The fix is targeted content, structured data,
                reputation signals, and consistent naming.
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
              <p className="text-gray-600">Actionable steps to increase your presence in AI assistant responses.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(Array.isArray(recommendations) ? recommendations : []).map((rec: any, index: number) => (
                <Card
                  key={index}
                  className={`hover:shadow-lg transition-shadow ${
                    recommendations.length % 2 === 1 && index === recommendations.length - 1
                      ? "md:col-span-2 lg:col-span-1"
                      : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-lg font-medium text-[#30594B]">{rec?.title}</CardTitle>
                      {rec?.priority && (
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
                          {rec.priority || "info"}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm leading-relaxed">{rec?.description}</p>
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
                Contact Featherstone Intelligence to develop a focused plan to raise these scores over the next 30–60
                days.
              </p>
            </div>
            <div className="flex justify-center items-center w-full pt-4">
              <Button size="lg" className="bg-[#30594B] hover:bg-[#30594B]/90">
                Schedule Consultation
              </Button>
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
  const progress = Number(job?.progress || 0)
  const currentPrompt = Number(job?.current_prompt || 0)
  const totalPrompts = Number(job?.total_prompts || 10)

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
          <p className="text-xl font-serif font-semibold text-foreground">ANALYZING AI VISIBILITY...</p>
          {job && job?.status === "processing" ? (
            <>
              <p className="text-sm text-muted-foreground">
                Testing prompt {currentPrompt} of {totalPrompts} ({progress}%)
              </p>
              <div className="w-64 mx-auto">
                <Progress value={progress} className="h-2" />
              </div>
            </>
          ) : (
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
