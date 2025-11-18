"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect, useRef } from "react"
import { Navigation } from "@/components/navigation"
import { CheckCircle2, XCircle, TrendingUp, Target, Lightbulb, Award, MapPin, Heart, Repeat, RefreshCw, ExternalLink, FileText, MessageSquare, Globe } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { getSpecialtyDisplayName, type WinerySpecialty } from '@/lib/prompts'

interface DashboardViewProps {
  auditId: string
  websiteUrl: string
  onBack: () => void
}

function extractCompetitorsFromResponses(prompts: any[], websiteUrl: string) {
  if (!websiteUrl || typeof websiteUrl !== 'string') {
    console.log('[v0 Debug] extractCompetitors received invalid websiteUrl:', typeof websiteUrl)
    return []
  }
  
  // Extract business name from URL for filtering
  const businessDisplay = websiteUrl.replace(/^https?:\/\/(www\.)?/, '').split('.')[0]
  const businessNorm = typeof businessDisplay === 'string' ? businessDisplay.toLowerCase().replace(/[-_]/g, '') : ''
  
  const competitorMentions = new Map<string, { count: number, positions: number[] }>()
  
  prompts.forEach((prompt) => {
    if (!prompt?.response || typeof prompt.response !== 'string') return
    
    // Extract winery names using the same pattern as perplexity.ts
    const wineryPattern = /\b[A-Z][a-zA-Z\s&''-]+?(Vineyard|Vineyards|Winery|Wineries|Estate|Cellars|Wines)\b/g
    const candidates = Array.from(new Set(prompt.response.match(wineryPattern) || []))
    
    candidates.forEach((name, index) => {
      if (!name || typeof name !== 'string') {
        console.log('[v0 Debug] Skipping non-string candidate:', typeof name)
        return
      }
      const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '')
      // Skip if it's the business itself
      if (normalized.includes(businessNorm) || businessNorm.includes(normalized)) {
        return
      }
      
      const existing = competitorMentions.get(name)
      if (existing) {
        existing.count++
        existing.positions.push(index + 1)
      } else {
        competitorMentions.set(name, { count: 1, positions: [index + 1] })
      }
    })
  })
  
  // Convert to sorted array
  const competitors = Array.from(competitorMentions.entries())
    .map(([name, data]) => ({
      name,
      mentions: data.count,
      avgPosition: data.positions.reduce((sum, p) => sum + p, 0) / data.positions.length
    }))
    .sort((a, b) => b.mentions - a.mentions) // Sort by mention count descending
  
  return competitors
}

function extractContextQuotes(prompts: any[], websiteUrl: string) {
  if (!websiteUrl || typeof websiteUrl !== 'string') {
    console.log('[v0 Debug] extractContextQuotes received invalid websiteUrl:', typeof websiteUrl)
    return []
  }
  
  // Extract business name from URL for matching
  const businessDisplay = websiteUrl.replace(/^https?:\/\/(www\.)?/, '').split('.')[0]
  const businessNorm = typeof businessDisplay === 'string' ? businessDisplay.toLowerCase().replace(/[-_]/g, '') : ''
  
  const quotes: string[] = []
  
  prompts.forEach((prompt) => {
    if (!prompt?.analysis?.mentioned || !prompt?.response || typeof prompt.response !== 'string') return
    
    // Split response into sentences
    const sentences = prompt.response.split(/[.!?]+/).filter((s: string) => s && typeof s === 'string' && s.trim().length > 0)
    
    // Find sentences that mention the business
    for (const sentence of sentences) {
      if (!sentence || typeof sentence !== 'string') continue
      const normalized = sentence.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (normalized.includes(businessNorm)) {
        // Clean up the sentence and add it
        const cleanSentence = sentence.trim()
        if (cleanSentence.length > 20 && cleanSentence.length < 500) {
          quotes.push(cleanSentence)
        }
        break // Only take one sentence per prompt
      }
    }
  })
  
  // Return 2-3 diverse quotes
  return quotes.slice(0, 3)
}

function highlightSentimentKeywords(text: string) {
  if (!text || typeof text !== 'string') {
    console.log('[v0 Debug] highlightSentimentKeywords received non-string:', typeof text)
    return [{ text: '', type: 'neutral' as const }]
  }
  
  const positiveWords = ['best', 'excellent', 'stunning', 'award-winning', 'exceptional', 'romantic', 'beautiful', 'renowned', 'famous', 'elegant', 'premium', 'top-rated', 'celebrated', 'outstanding', 'spectacular']
  const negativeWords = ['avoid', 'disappointing', 'overpriced', 'mediocre', 'underwhelming', 'poor', 'worst', 'limited', 'lacking']
  
  const parts: Array<{ text: string, type: 'positive' | 'negative' | 'neutral' }> = []
  const words = text.split(/(\s+)/)
  
  words.forEach((word) => {
    if (!word || typeof word !== 'string') {
      parts.push({ text: word || '', type: 'neutral' })
      return
    }
    const cleanWord = word.toLowerCase().replace(/[^a-z-]/g, '')
    if (positiveWords.includes(cleanWord)) {
      parts.push({ text: word, type: 'positive' })
    } else if (negativeWords.includes(cleanWord)) {
      parts.push({ text: word, type: 'negative' })
    } else {
      parts.push({ text: word, type: 'neutral' })
    }
  })

  return parts
}

function extractCitationSourcesFromResponses(prompts: any[], websiteUrl: string) {
  const citationSources = {
    reddit: 0,
    reviewSites: 0,
    ownedWebsite: 0,
    news: 0,
    other: 0,
  }

  if (!websiteUrl || typeof websiteUrl !== 'string') {
    console.log('[v0 Debug] extractCitationSources received invalid websiteUrl:', typeof websiteUrl)
    return citationSources
  }

  // Extract domain from website URL for comparison
  let websiteDomain = ''
  try {
    websiteDomain = new URL(websiteUrl).hostname.replace('www.', '')
  } catch (e) {
    console.error('[v0] Error parsing website URL:', e)
  }

  // Note: Since citations aren't stored in the database, we'll simulate 
  // distribution based on mention patterns in the response text
  // In a real implementation, this would use the actual citations array
  prompts.forEach((prompt) => {
    if (!prompt?.response || typeof prompt.response !== 'string') return
    
    const response = prompt.response.toLowerCase()
    
    // Count source mentions in the response
    if (response.includes('reddit') || response.includes('r/')) {
      citationSources.reddit++
    }
    if (response.includes('yelp') || response.includes('tripadvisor') || response.includes('google maps') || response.includes('opentable')) {
      citationSources.reviewSites++
    }
    if (response.includes(websiteDomain)) {
      citationSources.ownedWebsite++
    }
    if (response.includes('news') || response.includes('article') || response.includes('blog') || response.includes('magazine')) {
      citationSources.news++
    }
    
    // If mentioned but no specific source detected, count as other
    if (prompt.analysis?.mentioned && 
        citationSources.reddit === 0 && 
        citationSources.reviewSites === 0 && 
        citationSources.ownedWebsite === 0 && 
        citationSources.news === 0) {
      citationSources.other++
    }
  })

  return citationSources
}

function generateCitationInsights(citationSources: any, websiteUrl: string) {
  const total = Object.values(citationSources).reduce((sum: number, val: any) => sum + val, 0)
  
  if (total === 0) {
    return [
      "No citations detected across AI responses - this indicates very low AI visibility.",
      "Focus on claiming business listings on Google, Yelp, and TripAdvisor to establish an online presence.",
      "Add schema markup to your website to help AI assistants understand and cite your content.",
    ]
  }

  const insights: string[] = []
  const reviewSitesPercent = Math.round((citationSources.reviewSites / total) * 100)
  const ownedWebsitePercent = Math.round((citationSources.ownedWebsite / total) * 100)
  const newsPercent = Math.round((citationSources.news / total) * 100)
  const redditPercent = Math.round((citationSources.reddit / total) * 100)

  // Review sites insight
  if (reviewSitesPercent >= 60) {
    insights.push(`AI cited review sites ${reviewSitesPercent}% of the time - focus on improving your TripAdvisor, Yelp, and Google reviews to strengthen these citations.`)
  } else if (reviewSitesPercent >= 30) {
    insights.push(`Review sites represent ${reviewSitesPercent}% of citations - continue collecting reviews and responding to feedback to increase this source.`)
  } else {
    insights.push(`Review sites represent only ${reviewSitesPercent}% of citations - claim and optimize your business listings on Yelp, TripAdvisor, and Google Maps.`)
  }

  // Owned website insight
  if (ownedWebsitePercent === 0) {
    insights.push("Your website was cited 0 times - add structured data (schema markup) to help AI assistants understand and cite your content directly.")
  } else if (ownedWebsitePercent < 20) {
    insights.push(`Your website represents only ${ownedWebsitePercent}% of citations - enhance your site with schema markup, FAQ pages, and authoritative content.`)
  } else {
    insights.push(`Your website represents ${ownedWebsitePercent}% of citations - excellent! Continue publishing high-quality content and maintaining schema markup.`)
  }

  // News/media insight
  if (newsPercent >= 30) {
    insights.push(`Strong media presence with ${newsPercent}% of citations from news sources - maintain PR relationships and seek additional coverage.`)
  } else if (newsPercent < 10 && newsPercent > 0) {
    insights.push(`Limited media coverage (${newsPercent}% of citations) - consider partnering with wine bloggers and local tourism publications.`)
  }

  // Reddit insight (usually not ideal)
  if (redditPercent >= 20) {
    insights.push(`${redditPercent}% of citations are from Reddit - while community-driven, focus on building authority sources like news and your own site.`)
  }

  return insights.slice(0, 3) // Return top 3 most relevant insights
}

function generateDynamicRecommendations(audit: any, citationSources: any, totalPrompts: number) {
  const recommendations: Array<{
    title: string
    description: string
    reason: string
    impact: string
    timeEstimate: string
    priority: 'high' | 'medium' | 'low'
  }> = []

  const citationScore = Number(audit?.dimensionScores?.citationPresence ?? 0)
  const positionScore = Number(audit?.dimensionScores?.position ?? 0)
  const sentimentScore = Number(audit?.dimensionScores?.sentiment ?? 0)
  
  const totalCitations = Object.values(citationSources).reduce((sum: number, val: any) => sum + val, 0)
  const reviewSitesPercent = totalCitations > 0 ? (citationSources.reviewSites / totalCitations) * 100 : 0

  // Rule 1: Low citation score
  if (citationScore < 10) {
    recommendations.push({
      title: 'Claim Your Business Listings',
      description: 'Verify your business on Google Business Profile, TripAdvisor, and Yelp. These platforms are primary sources for AI assistants.',
      reason: `You're rarely mentioned by AI (Citation Score: ${citationScore}/25). AI assistants can\'t recommend what they can\'t find.`,
      impact: 'Could improve Citation Score by 10-15 points',
      timeEstimate: '2-3 hours',
      priority: 'high'
    })
  }

  // Rule 2: Low position score
  if (positionScore < 15) {
    recommendations.push({
      title: 'Build Authority with Press & Awards',
      description: 'Secure mentions in wine publications, submit for industry awards, and partner with local tourism boards to build credible authority signals.',
      reason: `AI sees competitors as more authoritative (Position Score: ${positionScore}/35). AI assistants see competitors as more authoritative.`,
      impact: 'Could improve Position Score by 15-20 points',
      timeEstimate: '1-2 months',
      priority: 'high'
    })
  }

  // Rule 3: Low sentiment score
  if (sentimentScore < 15) {
    recommendations.push({
      title: 'Improve Your Online Reputation',
      description: 'Address negative reviews professionally, highlight unique experiences on your website, and encourage satisfied guests to share their stories.',
      reason: `AI describes you neutrally or negatively (Sentiment Score: ${sentimentScore}/25). Positive sentiment signals directly influence recommendations.`,
      impact: 'Could improve Sentiment Score by 10-15 points',
      timeEstimate: '3-4 weeks',
      priority: 'high'
    })
  }

  // Rule 4: Website never cited
  if (citationSources.ownedWebsite === 0) {
    recommendations.push({
      title: 'Add Schema.org Structured Data',
      description: 'Implement LocalBusiness, FAQPage, and Event schema markup on your website to help AI assistants understand and cite your content directly.',
      reason: `AI never cited your website (0 citations from your domain). Your site is invisible to AI crawlers without structured data.`,
      impact: 'Could improve Citation Score by 8-12 points',
      timeEstimate: '4-6 hours',
      priority: 'high'
    })
  }

  // Rule 5: Heavy reliance on review sites
  if (reviewSitesPercent > 50 && totalCitations > 0) {
    recommendations.push({
      title: 'Maintain 4.5+ Star Ratings on Review Sites',
      description: 'Respond to all reviews within 48 hours, address concerns professionally, and encourage happy guests to leave reviews.',
      reason: `AI relies heavily on review sites (${Math.round(reviewSitesPercent)}% of citations). Your ratings directly influence AI recommendations.`,
      impact: 'Could improve overall score by 5-10 points',
      timeEstimate: '30 min/week ongoing',
      priority: 'medium'
    })
  }

  // Additional recommendations for medium scores
  if (citationScore >= 10 && citationScore < 20) {
    recommendations.push({
      title: 'Expand Your Content Footprint',
      description: 'Publish blog posts answering common wine country questions, create FAQ pages, and ensure your content matches the queries AI users ask.',
      reason: `You have moderate visibility (Citation Score: ${citationScore}/25). Strategic content can push you into the top tier.`,
      impact: 'Could improve Citation Score by 5-8 points',
      timeEstimate: '2-3 hours/week',
      priority: 'medium'
    })
  }

  if (positionScore >= 15 && positionScore < 25) {
    recommendations.push({
      title: 'Optimize for Featured Snippets',
      description: 'Structure your website content to answer specific questions clearly, using headers and bullet points that AI can easily parse.',
      reason: `You're in the mix but not at the top (Position Score: ${positionScore}/35). Better content structure can move you to #1-3 positions.`,
      impact: 'Could improve Position Score by 8-12 points',
      timeEstimate: '3-4 hours',
      priority: 'medium'
    })
  }

  // Low priority recommendations
  if (recommendations.length < 5) {
    recommendations.push({
      title: 'Ensure NAP Consistency',
      description: 'Verify your Name, Address, and Phone number are identical across all online listings, directories, and your website.',
      reason: 'Inconsistent business information confuses AI assistants and reduces your visibility across platforms.',
      impact: 'Could improve overall score by 3-5 points',
      timeEstimate: '1-2 hours',
      priority: 'low'
    })
  }

  // Sort by priority and return top 5
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return recommendations
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 5)
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
      <div className="min-h-screen bg-white">
        <Navigation onLogoClick={onBack} />
        
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
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

    const competitors = extractCompetitorsFromResponses(prompts, websiteUrl)
    const topCompetitors = competitors.slice(0, 3)
    
    const contextQuotes = extractContextQuotes(prompts, websiteUrl)

    const citationSources = extractCitationSourcesFromResponses(prompts, websiteUrl)
    const citationInsights = generateCitationInsights(citationSources, websiteUrl)
    
    // Prepare data for pie chart
    const chartData = [
      { name: 'Review Sites', value: citationSources.reviewSites, color: '#30594B' },
      { name: 'News & Media', value: citationSources.news, color: '#C5AA7D' },
      { name: 'Your Website', value: citationSources.ownedWebsite, color: '#6B9B8A' },
      { name: 'Reddit', value: citationSources.reddit, color: '#FF6B6B' },
      { name: 'Other', value: citationSources.other, color: '#9CA3AF' },
    ].filter(item => item.value > 0) // Only show sources with data

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

    const recommendations = generateDynamicRecommendations(audit, citationSources, totalPrompts)

    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        {/* Navigation Component */}
        <Navigation onLogoClick={onBack} />

        {/* Header with page title */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 mt-20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif text-[#30594B]">AI Visibility Report</h1>
              <p className="text-sm text-gray-600 mt-1">{websiteUrl}</p>
              {audit.specialty && (
                <p className="text-sm text-primary font-medium mt-1">
                  Tested with prompts optimized for: {getSpecialtyDisplayName(audit.specialty as WinerySpecialty)}
                </p>
              )}
            </div>
            <Button onClick={onBack} variant="outline">
              New Audit
            </Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto px-6 py-12">
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
                <CardContent className="space-y-3">
                  <Progress value={(dimensionScores.citationPresence / 25) * 100} className="h-2" />
                  <p className="text-sm text-gray-600">
                    {dimensionScores.citationPresence >= 20
                      ? "Excellent – mentioned by name consistently"
                      : dimensionScores.citationPresence >= 10
                        ? "Good – mentioned indirectly or by category"
                        : "Needs work – rarely mentioned by name"}
                  </p>
                  
                  {topCompetitors.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-2">Most mentioned competitors:</p>
                      <div className="space-y-1.5">
                        {topCompetitors.map((comp, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{comp.name}</span>
                            <span className="text-gray-500 font-medium">{comp.mentions} {comp.mentions === 1 ? 'mention' : 'mentions'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                <CardContent className="space-y-3">
                  <Progress value={(dimensionScores.position / 35) * 100} className="h-2" />
                  <p className="text-sm text-gray-600">
                    {dimensionScores.position >= 30
                      ? "Excellent – often recommended first"
                      : dimensionScores.position >= 15
                        ? "Good – appearing in top recommendations"
                        : "Needs work – rarely at the top"}
                  </p>
                  
                  {topCompetitors.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-2">Top competitors ranked:</p>
                      <div className="space-y-1.5">
                        {topCompetitors.map((comp, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{comp.name}</span>
                            <span className="text-gray-500 font-medium">#{comp.avgPosition.toFixed(1)} avg</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                <CardContent className="space-y-3">
                  <Progress value={(dimensionScores.sentiment / 25) * 100} className="h-2" />
                  <p className="text-sm text-gray-600">
                    {dimensionScores.sentiment >= 20
                      ? "Positive tone dominates"
                      : dimensionScores.sentiment >= 10
                        ? "Mostly neutral"
                        : "Needs work – limited positive signals"}
                  </p>
                  
                  {contextQuotes.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-3">How AI Describes You:</p>
                      <div className="space-y-3">
                        {contextQuotes.map((quote, i) => {
                          const highlightedParts = highlightSentimentKeywords(quote)
                          return (
                            <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <p className="text-xs text-gray-700 leading-relaxed">
                                "
                                {highlightedParts.map((part, j) => (
                                  <span
                                    key={j}
                                    className={
                                      part.type === 'positive'
                                        ? 'text-green-600 font-medium'
                                        : part.type === 'negative'
                                          ? 'text-red-600 font-medium'
                                          : ''
                                    }
                                  >
                                    {part.text}
                                  </span>
                                ))}
                                "
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
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

          <section className="space-y-6">
            <div>
              <h3 className="text-2xl font-serif text-[#30594B] mb-2">Citation Source Analysis</h3>
              <p className="text-gray-600">
                Understanding where AI assistants find information about your business.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-[#30594B] flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Source Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {chartData.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e5e0',
                              borderRadius: '8px',
                              padding: '8px 12px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      No citation data available
                    </div>
                  )}
                  
                  {/* Legend with counts */}
                  <div className="mt-6 space-y-3 border-t border-gray-200 pt-4">
                    {chartData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-gray-700">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Key Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-[#30594B] flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-[#C5AA7D]" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {citationInsights.map((insight, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#30594B]/10 flex items-center justify-center text-xs font-medium text-[#30594B]">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
                    </div>
                  ))}
                  
                  {/* Source breakdown with icons */}
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Source Breakdown</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <FileText className="w-4 h-4 text-[#30594B]" />
                        <div>
                          <p className="text-xs text-gray-500">Review Sites</p>
                          <p className="text-sm font-semibold text-gray-900">{citationSources.reviewSites}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Globe className="w-4 h-4 text-[#C5AA7D]" />
                        <div>
                          <p className="text-xs text-gray-500">News & Media</p>
                          <p className="text-sm font-semibold text-gray-900">{citationSources.news}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <ExternalLink className="w-4 h-4 text-[#6B9B8A]" />
                        <div>
                          <p className="text-xs text-gray-500">Your Website</p>
                          <p className="text-sm font-semibold text-gray-900">{citationSources.ownedWebsite}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Community</p>
                          <p className="text-sm font-semibold text-gray-900">{citationSources.reddit + citationSources.other}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

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

          {/* Recommendations */}
          <section id="recommendations" className="space-y-6">
            <div>
              <h3 className="text-2xl font-serif text-[#30594B] mb-2 flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-[#C5AA7D]" />
                How to Improve Your AI Visibility
              </h3>
              <p className="text-gray-600">Prioritized recommendations based on your audit results.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recommendations.map((rec, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-lg font-medium text-[#30594B]">{rec.title}</CardTitle>
                      <Badge
                        variant={
                          rec.priority === "high"
                            ? "destructive"
                            : rec.priority === "medium"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs flex-shrink-0"
                      >
                        {rec.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{rec.description}</p>
                    
                    {/* Why this matters */}
                    <div className="bg-[#30594B]/5 rounded-lg p-3 border-l-2 border-[#30594B]">
                      <p className="text-xs font-medium text-[#30594B] mb-1">Why this matters:</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{rec.reason}</p>
                    </div>

                    {/* Impact and time estimates */}
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-[#C5AA7D]" />
                        <span className="text-gray-600">{rec.impact}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-[#C5AA7D]" />
                        <span className="text-gray-600">{rec.timeEstimate}</span>
                      </div>
                    </div>
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
      <div className="min-h-screen bg-white">
        <Navigation onLogoClick={onBack} />
        
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
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
      </div>
    )
  }

  // Otherwise keep showing progress
  const progress = Number(job?.progress || 0)
  const currentPrompt = Number(job?.current_prompt || 0)
  const totalPrompts = Number(job?.total_prompts || 10)

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#30594B] via-[#3d6658] to-[#C5AA7D]">
      {/* Wine country pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23FAFAF8' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating wine-themed decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-32 h-32 bg-[#FAFAF8]/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 right-10 w-40 h-40 bg-[#FAFAF8]/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FAFAF8]/3 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-12 max-w-3xl">
          
          {/* Premium logo section with refined animation */}
          <div className="space-y-6">
            <div className="relative inline-block">
              {/* Elegant glow effect */}
              <div className="absolute inset-0 bg-[#FAFAF8]/10 rounded-full blur-2xl" />
              
              {/* Logo with smooth rotation */}
              <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto">
                <div 
                  className="w-full h-full animate-spin-logo"
                  style={{ 
                    animation: 'spin 4s ease-in-out infinite',
                  }}
                >
                  <img
                    src="/images/featherstone-logo.png"
                    alt="Featherstone Intelligence"
                    className="w-full h-full object-contain drop-shadow-2xl"
                    onError={(e) => {
                      console.error("[v0] Logo image failed to load")
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Elegant heading with gold accent */}
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-serif font-semibold text-[#FAFAF8] tracking-wide leading-tight">
                Analyzing Your<br />AI Visibility
              </h2>
              
              {/* Decorative divider */}
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

          {/* Progress section with refined design */}
          {job && job?.status === "processing" && (
            <div className="space-y-8">
              
              {/* Progress card */}
              <div className="bg-white/95 backdrop-blur-xl border border-[#FAFAF8]/20 rounded-2xl p-8 shadow-2xl">
                <div className="space-y-6">
                  
                  {/* Progress header */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#30594B]/70 uppercase tracking-wider">Progress</span>
                    <span className="text-4xl font-bold text-[#30594B]">{progress}%</span>
                  </div>

                  {/* Premium progress bar */}
                  <div className="space-y-3">
                    <div className="h-3 bg-[#30594B]/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#30594B] to-[#C5AA7D] rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#30594B]/60">
                        Testing prompt {currentPrompt} of {totalPrompts}
                      </span>
                      <span className="text-[#30594B]/60 font-medium">
                        {totalPrompts - currentPrompt} remaining
                      </span>
                    </div>
                  </div>

                  {/* Wine-themed status indicators */}
                  <div className="pt-6 border-t border-[#30594B]/10">
                    <div className="grid grid-cols-3 gap-4">
                      
                      {/* Analyzing */}
                      <div className="text-center space-y-2">
                        <div className="inline-flex p-3 bg-[#30594B]/10 rounded-xl">
                          <svg className="w-6 h-6 text-[#30594B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                        </div>
                        <p className="text-xs text-[#30594B]/70 font-medium">Analyzing</p>
                      </div>

                      {/* Quality Check */}
                      <div className="text-center space-y-2">
                        <div className="inline-flex p-3 bg-[#C5AA7D]/10 rounded-xl">
                          <svg className="w-6 h-6 text-[#C5AA7D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        </div>
                        <p className="text-xs text-[#C5AA7D]/70 font-medium">Verifying</p>
                      </div>

                      {/* Compiling */}
                      <div className="text-center space-y-2">
                        <div className="inline-flex p-3 bg-[#30594B]/10 rounded-xl">
                          <svg className="w-6 h-6 text-[#30594B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-xs text-[#30594B]/70 font-medium">Compiling</p>
                      </div>

                    </div>
                  </div>

                </div>
              </div>

              {/* Subtle reassurance message */}
              <p className="text-[#FAFAF8]/60 text-sm font-light italic">
                This comprehensive analysis typically takes 2-3 minutes
              </p>

            </div>
          )}

          {/* Initial queue state */}
          {(!job || job?.status === "queued") && (
            <div className="space-y-6">
              
              {/* Animated dots loader */}
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
          )}

        </div>
      </div>

      {/* Premium animation keyframes */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}
