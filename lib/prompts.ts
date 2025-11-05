// Test prompts for AI visibility checking
// These are Napa Valley hospitality-specific prompts

export const TEST_PROMPTS = ["Recommend dog-friendly wineries in Napa Valley"]

// Full prompt set available for future use when processing time is optimized
export const FULL_PROMPT_SET = [
  "Best wineries in Napa Valley",
  "Top wine tasting experiences in Napa",
  "Where to stay for a wine country vacation",
  "Sustainable wineries in Napa Valley",
  "Wine tours for couples in Napa",
  "Family-friendly wineries in Napa",
  "Best restaurants in Napa wine country",
  "Luxury wine country hotels",
  "Napa Valley wedding venues",
  "Private wine tasting experiences",
  "Organic wineries in Napa",
  "Best Cabernet Sauvignon in Napa",
  "Wine country spa resorts",
  "Napa Valley bike tours",
  "Best views in Napa wine country",
  "Historic wineries in Napa Valley",
  "Small boutique wineries Napa",
  "Wine and food pairing experiences",
  "Napa Valley harvest season activities",
  "Best time to visit Napa Valley",
  "Napa Valley day trip itinerary",
  "Pet-friendly wineries in Napa",
  "Accessible wineries for wheelchairs",
  "Napa Valley wine clubs",
  "Educational wine tours Napa Valley",
]

// Extract domain from URL for mention checking
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace("www.", "")
  } catch {
    return url
  }
}

// Check if a response mentions the target website
export function checkMention(response: string, websiteUrl: string): boolean {
  const domain = extractDomain(websiteUrl)
  const domainPattern = new RegExp(domain.replace(".", "\\."), "i")
  return domainPattern.test(response)
}

// Extract competitor names from AI responses
export function extractCompetitors(response: string): string[] {
  // Simple extraction - looks for capitalized phrases that might be business names
  // This is a basic implementation - could be enhanced with NLP
  const competitors: string[] = []

  // Match patterns like "Visit [Name] Winery" or "[Name] Estate"
  const patterns = [
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:Winery|Vineyard|Estate|Cellars|Wines)/g,
    /(?:Visit|Try|Check out)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
  ]

  patterns.forEach((pattern) => {
    const matches = response.matchAll(pattern)
    for (const match of matches) {
      if (match[1] && match[1].length > 2) {
        competitors.push(match[1].trim())
      }
    }
  })

  return [...new Set(competitors)] // Remove duplicates
}
