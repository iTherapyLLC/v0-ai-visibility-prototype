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

// Helper function to calculate detail score
function calculateDetailScore(analysis: VisibilityAnalysis): number {
  const { mentioned, position, sentiment, mentionCount } = analysis
  let score = 0

  if (mentioned) {
    score += 10 // Base score for being mentioned
  }

  if (position !== null && position <= 3) {
    score += 5 // Additional score for being in top 3 positions
  }

  if (sentiment === "positive") {
    score += 5 // Additional score for positive sentiment
  } else if (sentiment === "negative") {
    score -= 5 // Deduct score for negative sentiment
  }

  score += Math.min(mentionCount, 5) * 2 // Additional score for mentions, capped at 10

  return Math.max(0, score) // Ensure score is not negative
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

// Helper functions for improved mention detection
function norm(s: string): string {
  if (!s || typeof s !== 'string') return ''
  return s.toLowerCase().replace(/[^a-z0-9]/g, "") // remove spaces, punctuation
}

// Derive a display name from the domain for matching (no TLD)
function nameFromUrl(websiteUrl: string): string {
  try {
    const host = new URL(websiteUrl).hostname.replace(/^www\./, "")
    // take the left-most label (before first dot)
    const left = host.split(".")[0] // 'robertmondaviwinery'
    // replace dashes/underscores with spaces (handles e.g. 'robert-mondavi-winery')
    return left.replace(/[-_]+/g, " ").trim() // 'robertmondaviwinery' -> unchanged; dash cases become spaced
  } catch {
    return ""
  }
}

function analyzeResponse(
  aiResponse: string,
  businessName: string,
  websiteUrl: string,
  citations: string[],
): VisibilityAnalysis {
  const businessDisplay = nameFromUrl(websiteUrl) // 'robertmondaviwinery'
  const bizNorm = norm(businessDisplay) // 'robertmondaviwinery'
  const responseNorm = norm(aiResponse) // whole response normalized

  // 1) Raw mention check (handles domain form vs spaced form)
  let mentioned = responseNorm.includes(bizNorm)

  // 2) Extract candidate winery names from the response (Title-cased + common suffixes)
  const wineryPattern = /\b[A-Z][a-zA-Z\s&''-]+?(Vineyard|Vineyards|Winery|Wineries|Estate|Cellars|Wines)\b/g
  const candidates = Array.from(new Set(aiResponse.match(wineryPattern) || []))

  // 3) If not found via raw substring, compare normalized candidates
  if (!mentioned) {
    mentioned = candidates.some((c) => norm(c).includes(bizNorm) || bizNorm.includes(norm(c)))
  }

  // 4) Compute position using normalized comparison against the ordered unique candidates list
  let position: number | null = null
  if (mentioned && candidates.length) {
    for (let i = 0; i < candidates.length; i++) {
      const cNorm = norm(candidates[i])
      if (cNorm.includes(bizNorm) || bizNorm.includes(cNorm)) {
        position = i + 1 // 1-indexed
        break
      }
    }
  }

  console.log(`[v0] Found ${candidates.length} businesses, target at position ${position}`)

  // Count mentions using normalized comparison
  const mentionCount = mentioned
    ? candidates.filter((c) => {
        const cNorm = norm(c)
        return cNorm.includes(bizNorm) || bizNorm.includes(cNorm)
      }).length
    : 0

  // Extract competitors (exclude the target business)
  const competitors = candidates
    .filter((c) => {
      const cNorm = norm(c)
      return !(cNorm.includes(bizNorm) || bizNorm.includes(cNorm))
    })
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
        const urlLower = url?.toLowerCase() ?? ''
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

    const hasPositive = positiveWords.some((word) => responseNorm.includes(norm(word)))
    const hasNegative = negativeWords.some((word) => responseNorm.includes(norm(word)))

    if (hasPositive && !hasNegative) sentiment = "positive"
    else if (hasNegative && !hasPositive) sentiment = "negative"
    else sentiment = "neutral"

    // Extract context (sentence containing business name)
    const sentences = aiResponse.split(/[.!?]+/)
    for (const sentence of sentences) {
      const sentenceNorm = norm(sentence)
      if (sentenceNorm.includes(bizNorm)) {
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

  const mentionedResults = results.filter((r) => r.analysis.mentioned)
  const mentionCount = mentionedResults.length

  // CRITICAL: If nothing was mentioned, all scores must be 0
  if (mentionCount === 0) {
    return {
      overall: 0,
      citation: 0,
      position: 0,
      sentiment: 0,
      frequency: 0,
    }
  }

  // Citation Presence Score (0-25) - based on total tests
  const citationScore = Math.round((mentionCount / totalTests) * 25)

  // Frequency Score (0-15) - based on total tests
  const frequencyScore = Math.round((mentionCount / totalTests) * 15)

  // Position Score (0-35) - ONLY from mentioned results
  const positions = mentionedResults
    .filter((r) => r.analysis.position !== null)
    .map((r) => r.analysis.position!)
  
  const avgPosition = positions.length > 0 
    ? positions.reduce((sum, p) => sum + p, 0) / positions.length 
    : 999 // Default to worst position if no valid positions
  
  const positionScore = Math.max(0, Math.round(35 - avgPosition * 5))

  // Sentiment Score (0-25) - ONLY from mentioned results
  const sentimentScores = { positive: 25, neutral: 15, negative: 5, not_mentioned: 0 }
  const avgSentiment = 
    mentionedResults.reduce((sum, r) => sum + sentimentScores[r.analysis.sentiment], 0) / mentionCount
  const sentimentScore = Math.round(avgSentiment)

  return {
    overall: citationScore + positionScore + sentimentScore + frequencyScore,
    citation: citationScore,
    position: positionScore,
    sentiment: sentimentScore,
    frequency: frequencyScore,
  }
}
