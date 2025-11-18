// Test prompts for AI visibility checking
// These are Napa Valley hospitality-specific prompts

export const TEST_PROMPTS = ["Recommend dog-friendly wineries in Napa Valley"]

export type WinerySpecialty = 'cabernet' | 'chardonnay' | 'pinot' | 'sparkling' | 'multiple' | null

const UNIVERSAL_PROMPTS = [
  { category: 'discovery', text: 'Best wineries in Napa for first-time visitors' },
  { category: 'discovery', text: 'Wineries with food pairings in Napa Valley' },
  { category: 'experience', text: 'Family-friendly wineries in Napa' },
  { category: 'experience', text: 'Romantic wineries in Napa for couples' },
  { category: 'experience', text: 'Best value wine tasting in Napa Valley' },
  { category: 'experience', text: 'Historic Napa Valley wineries to visit' },
  { category: 'practical', text: 'Napa wineries that don\'t require reservations' },
]

const SPECIALTY_PROMPTS: Record<NonNullable<WinerySpecialty>, Array<{ category: string; text: string }>> = {
  cabernet: [
    { category: 'discovery', text: 'Top Napa wineries for Cabernet Sauvignon' },
    { category: 'discovery', text: 'Best Stags Leap District wineries' },
    { category: 'discovery', text: 'Premium Cabernet tasting rooms in Napa' },
  ],
  chardonnay: [
    { category: 'discovery', text: 'Best Napa Chardonnay producers' },
    { category: 'discovery', text: 'Top wineries for white wine in Napa Valley' },
    { category: 'discovery', text: 'Napa wineries known for Burgundian-style Chardonnay' },
  ],
  pinot: [
    { category: 'discovery', text: 'Top Napa Pinot Noir wineries' },
    { category: 'discovery', text: 'Best Carneros wineries for Pinot Noir' },
    { category: 'discovery', text: 'Napa wineries specializing in Pinot Noir' },
  ],
  sparkling: [
    { category: 'discovery', text: 'Best sparkling wine producers in Napa Valley' },
    { category: 'discovery', text: 'Top wineries for Champagne-style wines in Napa' },
    { category: 'discovery', text: 'Napa wineries with sparkling wine tasting flights' },
  ],
  multiple: [
    { category: 'discovery', text: 'Top Napa wineries for Cabernet Sauvignon' },
    { category: 'discovery', text: 'Best Napa Chardonnay producers' },
    { category: 'discovery', text: 'Best sparkling wine producers in Napa Valley' },
  ],
}

export function getPromptsForSpecialty(specialty: WinerySpecialty) {
  const varietalPrompts = specialty && specialty in SPECIALTY_PROMPTS 
    ? SPECIALTY_PROMPTS[specialty]
    : SPECIALTY_PROMPTS.multiple

  return [...UNIVERSAL_PROMPTS, ...varietalPrompts]
}

export function getSpecialtyDisplayName(specialty: WinerySpecialty): string {
  const displayNames: Record<NonNullable<WinerySpecialty>, string> = {
    cabernet: 'Cabernet Sauvignon',
    chardonnay: 'Chardonnay',
    pinot: 'Pinot Noir',
    sparkling: 'Sparkling Wines',
    multiple: 'Multiple Varietals',
  }
  return specialty ? displayNames[specialty] : 'Multiple Varietals'
}

// Full prompt set available for future use when processing time is optimized
export const FULL_PROMPT_SET = getPromptsForSpecialty('multiple')

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
