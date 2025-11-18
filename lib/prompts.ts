// Test prompts for AI visibility checking
// These are Napa Valley hospitality-specific prompts

export const TEST_PROMPTS = ["Recommend dog-friendly wineries in Napa Valley"]

// Full prompt set available for future use when processing time is optimized
export const FULL_PROMPT_SET = [
  // Discovery (1-7) - Expanded to test multiple wine varietals
  { category: 'discovery', text: 'Best wineries in Napa for first-time visitors' },
  { category: 'discovery', text: 'Top Napa wineries for Cabernet Sauvignon' },
  { category: 'discovery', text: 'Best Napa Chardonnay producers' },
  { category: 'discovery', text: 'Top Napa Pinot Noir wineries' },
  { category: 'discovery', text: 'Best sparkling wine producers in Napa Valley' },
  { category: 'discovery', text: 'Top Napa Sauvignon Blanc wineries' },
  { category: 'discovery', text: 'Wineries with food pairings in Napa Valley' },
  
  // Experience (8-11)
  { category: 'experience', text: 'Family-friendly wineries in Napa' },
  { category: 'experience', text: 'Romantic wineries in Napa for couples' },
  { category: 'experience', text: 'Best value wine tasting in Napa Valley' },
  { category: 'experience', text: 'Historic Napa Valley wineries to visit' },
  { category: 'experience', text: 'Winery tours in Napa Valley' },
  
  // Practical (12-14)
  { category: 'practical', text: 'Napa wineries that don\'t require reservations' },
  { category: 'practical', text: 'Small boutique wineries in Napa' },
  { category: 'practical', text: 'Napa wineries with beautiful architecture' },
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
