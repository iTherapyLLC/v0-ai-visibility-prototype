import OpenAI from "openai"
import { TEST_PROMPTS } from "./prompts"

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set")
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface PromptAnalysis {
  mentioned: boolean
  citationType: "by_name" | "by_category" | "not_mentioned"
  position: number | null // 1-based position, null if not mentioned
  sentiment: "positive" | "neutral" | "negative" | "not_mentioned"
  frequency: number // count of mentions in response
  competitors: string[]
}

export interface DimensionScores {
  citationPresence: number // 0-25
  position: number // 0-35
  sentiment: number // 0-25
  frequency: number // 0-15
}

export interface PromptResult {
  prompt: string
  platform: "chatgpt" | "perplexity" | "gemini"
  response: string
  mentioned: boolean
  competitors: string[]
  analysis: PromptAnalysis
  dimensionScores: DimensionScores
}

export interface VisibilityResult {
  totalPrompts: number
  mentionedIn: number
  visibilityPercentage: number
  promptResults: PromptResult[]
  overallDimensionScores: DimensionScores
  overallScore: number
}

async function analyzeResponse(response: string, businessName: string): Promise<PromptAnalysis> {
  try {
    const analysisPrompt = `Analyze this AI response for mentions of "${businessName}":

Response: "${response}"

Provide a JSON response with:
1. mentioned (boolean): Is the business mentioned?
2. citationType: "by_name" (explicitly named), "by_category" (e.g., "a winery in Napa"), or "not_mentioned"
3. position (number or null): If mentioned, what position in the list? (1 for first, 2 for second, etc., null if not in a list or not mentioned)
4. sentiment: "positive" (recommended/praised), "neutral" (just mentioned), "negative" (criticized), or "not_mentioned"
5. frequency (number): How many times is it mentioned? (0 if not mentioned)
6. competitors (array): List other business names mentioned

Return ONLY valid JSON, no other text.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing text for business mentions. Return only valid JSON.",
        },
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
      max_tokens: 300,
      temperature: 0.3,
      response_format: { type: "json_object" },
    })

    const analysisText = completion.choices[0]?.message?.content || "{}"
    const analysis = JSON.parse(analysisText)

    return {
      mentioned: analysis.mentioned || false,
      citationType: analysis.citationType || "not_mentioned",
      position: analysis.position || null,
      sentiment: analysis.sentiment || "not_mentioned",
      frequency: analysis.frequency || 0,
      competitors: analysis.competitors || [],
    }
  } catch (error) {
    console.error("[v0] Error analyzing response:", error)
    // Return default analysis on error
    return {
      mentioned: false,
      citationType: "not_mentioned",
      position: null,
      sentiment: "not_mentioned",
      frequency: 0,
      competitors: [],
    }
  }
}

function calculateDimensionScores(analysis: PromptAnalysis): DimensionScores {
  // Citation Presence Score (0-25 points)
  let citationPresence = 0
  if (analysis.citationType === "by_name") {
    citationPresence = 25
  } else if (analysis.citationType === "by_category") {
    citationPresence = 10
  }

  // Position Score (0-35 points)
  let position = 0
  if (analysis.position !== null) {
    if (analysis.position === 1) {
      position = 35
    } else if (analysis.position <= 3) {
      position = 25
    } else if (analysis.position <= 5) {
      position = 15
    } else {
      position = 5
    }
  }

  // Sentiment Score (0-25 points)
  let sentiment = 0
  if (analysis.sentiment === "positive") {
    sentiment = 25
  } else if (analysis.sentiment === "neutral") {
    sentiment = 15
  } else if (analysis.sentiment === "negative") {
    sentiment = 5
  }

  // Frequency Score (0-15 points)
  let frequency = 0
  if (analysis.frequency > 1) {
    frequency = 15
  } else if (analysis.frequency === 1) {
    frequency = 8
  }

  return {
    citationPresence,
    position,
    sentiment,
    frequency,
  }
}

export async function testAIVisibility(
  websiteUrl: string,
  prompts: string[] = TEST_PROMPTS,
): Promise<VisibilityResult> {
  const promptResults: PromptResult[] = []
  let mentionCount = 0

  // Extract business name from URL for analysis
  const businessName = websiteUrl.replace(/^https?:\/\/(www\.)?/, "").split(".")[0]

  console.log(`[v0] Testing AI visibility for ${websiteUrl} (${businessName}) with ${prompts.length} prompts`)

  // Accumulate dimension scores across all prompts
  const totalDimensionScores: DimensionScores = {
    citationPresence: 0,
    position: 0,
    sentiment: 0,
    frequency: 0,
  }

  // Process prompts in batches to avoid rate limits
  const batchSize = 5
  for (let i = 0; i < prompts.length; i += batchSize) {
    const batch = prompts.slice(i, i + batchSize)

    const batchResults = await Promise.all(
      batch.map(async (prompt) => {
        try {
          // Call ChatGPT API
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful travel and wine country expert. Provide recommendations for wineries, hotels, and experiences in Napa Valley.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            max_tokens: 500,
            temperature: 0.7,
          })

          const response = completion.choices[0]?.message?.content || ""

          const analysis = await analyzeResponse(response, businessName)
          const dimensionScores = calculateDimensionScores(analysis)

          const mentioned = analysis.mentioned
          const competitors = analysis.competitors

          if (mentioned) {
            mentionCount++
          }

          // Accumulate scores
          totalDimensionScores.citationPresence += dimensionScores.citationPresence
          totalDimensionScores.position += dimensionScores.position
          totalDimensionScores.sentiment += dimensionScores.sentiment
          totalDimensionScores.frequency += dimensionScores.frequency

          return {
            prompt,
            platform: "chatgpt" as const,
            response,
            mentioned,
            competitors,
            analysis,
            dimensionScores,
          }
        } catch (error) {
          console.error(`[v0] Error testing prompt "${prompt}":`, error)
          return {
            prompt,
            platform: "chatgpt" as const,
            response: "Error: Failed to get response",
            mentioned: false,
            competitors: [],
            analysis: {
              mentioned: false,
              citationType: "not_mentioned" as const,
              position: null,
              sentiment: "not_mentioned" as const,
              frequency: 0,
              competitors: [],
            },
            dimensionScores: {
              citationPresence: 0,
              position: 0,
              sentiment: 0,
              frequency: 0,
            },
          }
        }
      }),
    )

    promptResults.push(...batchResults)

    // Add delay between batches to respect rate limits
    if (i + batchSize < prompts.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  const avgDimensionScores: DimensionScores = {
    citationPresence: Math.round(totalDimensionScores.citationPresence / prompts.length),
    position: Math.round(totalDimensionScores.position / prompts.length),
    sentiment: Math.round(totalDimensionScores.sentiment / prompts.length),
    frequency: Math.round(totalDimensionScores.frequency / prompts.length),
  }

  const overallScore =
    avgDimensionScores.citationPresence +
    avgDimensionScores.position +
    avgDimensionScores.sentiment +
    avgDimensionScores.frequency

  const visibilityPercentage = Math.round((mentionCount / prompts.length) * 100)

  console.log(`[v0] Visibility test complete: ${mentionCount}/${prompts.length} mentions (${visibilityPercentage}%)`)
  console.log(`[v0] Overall score: ${overallScore}/100`)
  console.log(`[v0] Dimension scores:`, avgDimensionScores)

  return {
    totalPrompts: prompts.length,
    mentionedIn: mentionCount,
    visibilityPercentage,
    promptResults,
    overallDimensionScores: avgDimensionScores,
    overallScore,
  }
}

// Calculate projected visibility after improvements
export function calculateProjectedVisibility(
  currentVisibility: number,
  schemaScore: number,
  speedScore: number,
): number {
  // Simple projection model
  // If schema and speed are good, visibility could improve significantly

  let projectedIncrease = 0

  // Schema impact (up to +30%)
  if (schemaScore < 50) {
    projectedIncrease += 30
  } else if (schemaScore < 70) {
    projectedIncrease += 15
  }

  // Speed impact (up to +20%)
  if (speedScore < 50) {
    projectedIncrease += 20
  } else if (speedScore < 70) {
    projectedIncrease += 10
  }

  // Content/citation impact (base +15%)
  projectedIncrease += 15

  const projected = Math.min(currentVisibility + projectedIncrease, 95)
  return Math.round(projected)
}
