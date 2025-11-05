// Perplexity API integration for AI visibility testing
// Uses Sonar Pro model for real-time web search with citations

interface PerplexityResponse {
  id: string
  model: string
  created: number
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  citations?: string[]
  object: string
  choices: Array<{
    index: number
    finish_reason: string
    message: {
      role: string
      content: string
    }
  }>
}

export interface CitationSources {
  reddit: number
  reviewSites: number
  ownedWebsite: number
  news: number
  other: number
}

export interface VisibilityAnalysis {
  mentioned: boolean
  position: number | null
  competitors: string[]
  citationSources: CitationSources
  sentiment: "positive" | "neutral" | "negative" | "not_mentioned"
  context: string
  mentionCount: number
}

export interface VisibilityTestResult {
  prompt: string
  category: string
  response: string
  citations: string[]
  analysis: VisibilityAnalysis
  detailScore: number
}

export async function testVisibilityWithPerplexity(
  businessName: string,
  websiteUrl: string,
  prompt: string,
  category = "general",
): Promise<VisibilityTestResult> {
  const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY

  if (!PERPLEXITY_API_KEY) {
    throw new Error("PERPLEXITY_API_KEY is not configured")
  }

  console.log(`[v0] Testing visibility with Perplexity for: ${businessName}`)
  console.log(`[v0] Prompt: ${prompt}`)

  // Call Perplexity Sonar API
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 1000,
      return_citations: true,
      search_recency_filter: "month",
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[v0] Perplexity API error: ${response.status} - ${errorText}`)
    throw new Error(`Perplexity API error: ${response.status}`)
  }

  const data: PerplexityResponse = await response.json()
  const aiResponse = data.choices[0]?.message?.content || ""
  const citations = data.citations || []

  console.log(`[v0] Perplexity response received: ${aiResponse.substring(0, 100)}...`)
  console.log(`[v0] Citations count: ${citations.length}`)

  // Analyze response
  const analysis = analyzeResponse(aiResponse, businessName, websiteUrl, citations)

  // Calculate detail score
  const detailScore = calculateDetailScore(analysis)

  console.log(
    `[v0] Analysis complete - Mentioned: ${analysis.mentioned}, Position: ${analysis.position}, Sentiment: ${analysis.sentiment}`,
  )

  return {
    prompt,
    category,
    response: aiResponse,
    citations,
    analysis,
    detailScore,
  }
}

function analyzeResponse(
  aiResponse: string,
  businessName: string,
  websiteUrl: string,
  citations: string[],
): VisibilityAnalysis {
  const businessNameLower = businessName.toLowerCase()
  const responseLower = aiResponse.toLowerCase()

  // Check if mentioned
  const mentioned = responseLower.includes(businessNameLower)

  // Count mentions
  const mentionCount = (responseLower.match(new RegExp(businessNameLower, "g")) || []).length

  // Find position in list
  let position: number | null = null
  if (mentioned) {
    // Match winery/hospitality business names
    const businessPattern =
      /\b[A-Z][a-zA-Z\s&'-]+(Vineyard|Winery|Estate|Cellars|Wines|Inn|Lodge|Resort|Hotel|Restaurant)\b/g
    const allBusinesses = aiResponse.match(businessPattern) || []
    const uniqueBusinesses = Array.from(new Set(allBusinesses.map((w) => w.trim())))

    const foundIndex = uniqueBusinesses.findIndex((w) => w.toLowerCase().includes(businessNameLower))
    position = foundIndex >= 0 ? foundIndex + 1 : null

    console.log(`[v0] Found ${uniqueBusinesses.length} businesses, target at position ${position}`)
  }

  // Extract competitors
  const businessPattern =
    /\b[A-Z][a-zA-Z\s&'-]+(Vineyard|Winery|Estate|Cellars|Wines|Inn|Lodge|Resort|Hotel|Restaurant)\b/g
  const allMatches = aiResponse.match(businessPattern) || []
  const competitors = Array.from(new Set(allMatches))
    .map((w) => w.trim())
    .filter((w) => !w.toLowerCase().includes(businessNameLower))
    .slice(0, 10)

  console.log(`[v0] Found ${competitors.length} competitors`)

  // Categorize citations
  const citationSources: CitationSources = {
    reddit: 0,
    reviewSites: 0,
    ownedWebsite: 0,
    news: 0,
    other: 0,
  }

  try {
    const websiteDomain = new URL(websiteUrl).hostname.replace("www.", "")

    citations.forEach((url) => {
      try {
        const urlLower = url.toLowerCase()
        const domain = new URL(url).hostname

        if (urlLower.includes("reddit.com")) {
          citationSources.reddit++
        } else if (
          urlLower.includes("yelp.com") ||
          urlLower.includes("tripadvisor.com") ||
          urlLower.includes("google.com/maps") ||
          urlLower.includes("opentable.com")
        ) {
          citationSources.reviewSites++
        } else if (domain.includes(websiteDomain)) {
          citationSources.ownedWebsite++
        } else if (urlLower.includes("news") || urlLower.includes("blog") || urlLower.includes("article")) {
          citationSources.news++
        } else {
          citationSources.other++
        }
      } catch (e) {
        citationSources.other++
      }
    })
  } catch (e) {
    console.error("[v0] Error parsing website URL:", e)
  }

  // Analyze sentiment
  let sentiment: "positive" | "neutral" | "negative" | "not_mentioned" = "not_mentioned"
  let context = ""

  if (mentioned) {
    const positiveWords = [
      "best",
      "excellent",
      "outstanding",
      "exceptional",
      "stunning",
      "beautiful",
      "perfect",
      "amazing",
      "wonderful",
      "romantic",
      "elegant",
      "top",
      "premier",
      "renowned",
      "award-winning",
    ]
    const negativeWords = [
      "avoid",
      "disappointing",
      "poor",
      "worst",
      "overpriced",
      "crowded",
      "mediocre",
      "underwhelming",
    ]

    const hasPositive = positiveWords.some((word) => responseLower.includes(word))
    const hasNegative = negativeWords.some((word) => responseLower.includes(word))

    if (hasPositive && !hasNegative) sentiment = "positive"
    else if (hasNegative && !hasPositive) sentiment = "negative"
    else sentiment = "neutral"

    // Extract context (sentence containing business name)
    const sentences = aiResponse.split(/[.!?]+/)
    for (const sentence of sentences) {
      if (sentence.toLowerCase().includes(businessNameLower)) {
        context = sentence.trim()
        break
      }
    }
  }

  return {
    mentioned,
    position,
    competitors,
    citationSources,
    sentiment,
    context,
    mentionCount,
  }
}

function calculateDetailScore(analysis: VisibilityAnalysis): number {
  // Citation Presence (0-25)
  const citationScore = analysis.mentioned ? 25 : 0

  // Position Score (0-35)
  let positionScore = 0
  if (analysis.mentioned && analysis.position) {
    if (analysis.position === 1) positionScore = 35
    else if (analysis.position <= 3) positionScore = 25
    else if (analysis.position <= 5) positionScore = 15
    else positionScore = 5
  }

  // Sentiment Score (0-25)
  const sentimentScores = {
    positive: 25,
    neutral: 15,
    negative: 5,
    not_mentioned: 0,
  }
  const sentimentScore = sentimentScores[analysis.sentiment]

  // Frequency Score (0-15)
  const frequencyScore = Math.min(15, analysis.mentionCount * 5)

  return citationScore + positionScore + sentimentScore + frequencyScore
}

export async function batchTestVisibility(
  businessName: string,
  websiteUrl: string,
  prompts: Array<{ text: string; category: string }>,
): Promise<VisibilityTestResult[]> {
  const results: VisibilityTestResult[] = []

  console.log(`[v0] Starting batch test with ${prompts.length} prompts`)

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i]
    console.log(`[v0] Testing prompt ${i + 1}/${prompts.length}: ${prompt.text}`)

    try {
      const result = await testVisibilityWithPerplexity(businessName, websiteUrl, prompt.text, prompt.category)
      results.push(result)

      // Rate limiting - wait 1.5 seconds between requests
      if (i < prompts.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1500))
      }
    } catch (error) {
      console.error(`[v0] Error testing prompt: ${prompt.text}`, error)
      // Continue with other prompts even if one fails
    }
  }

  console.log(`[v0] Batch test complete: ${results.length}/${prompts.length} successful`)

  return results
}

// Helper function to extract business name from URL
export function extractBusinessName(url: string): string {
  try {
    const domain = new URL(url).hostname.replace("www.", "")
    const parts = domain.split(".")
    const name = parts[0]
    // Capitalize first letter
    return name.charAt(0).toUpperCase() + name.slice(1)
  } catch {
    return "Business"
  }
}

// Calculate overall scores from all test results
export function calculateOverallScores(results: VisibilityTestResult[]) {
  const totalTests = results.length
  if (totalTests === 0) {
    return {
      overall: 0,
      citation: 0,
      position: 0,
      sentiment: 0,
      frequency: 0,
    }
  }

  const mentionCount = results.filter((r) => r.analysis.mentioned).length

  // Citation Presence Score (0-25)
  const citationScore = Math.round((mentionCount / totalTests) * 25)

  // Position Score (0-35)
  const positions = results.filter((r) => r.analysis.position !== null).map((r) => r.analysis.position!)
  const avgPosition = positions.length > 0 ? positions.reduce((sum, p) => sum + p, 0) / positions.length : 0
  const positionScore = avgPosition > 0 ? Math.max(0, Math.round(35 - avgPosition * 5)) : 0

  // Sentiment Score (0-25)
  const sentimentScores = { positive: 25, neutral: 15, negative: 5, not_mentioned: 0 }
  const avgSentiment = results.reduce((sum, r) => sum + sentimentScores[r.analysis.sentiment], 0) / totalTests
  const sentimentScore = Math.round(avgSentiment)

  // Frequency Score (0-15)
  const frequencyScore = Math.round((mentionCount / totalTests) * 15)

  return {
    overall: citationScore + positionScore + sentimentScore + frequencyScore,
    citation: citationScore,
    position: positionScore,
    sentiment: sentimentScore,
    frequency: frequencyScore,
  }
}
