import * as cheerio from "cheerio"

export interface SchemaCheckResult {
  score: number
  status: "good" | "needs-attention" | "critical"
  details: string[]
  missingSchemas: string[]
  foundSchemas: string[]
}

// Check for structured data on a website
export async function checkSchemaHealth(websiteUrl: string): Promise<SchemaCheckResult> {
  try {
    // Fetch the website HTML
    const response = await fetch(websiteUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FeatherstoneBot/1.0)",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract JSON-LD structured data
    const jsonLdScripts = $('script[type="application/ld+json"]')
    const foundSchemas: string[] = []
    const details: string[] = []

    jsonLdScripts.each((_, element) => {
      try {
        const content = $(element).html()
        if (content) {
          const data = JSON.parse(content)
          const schemaType = Array.isArray(data)
            ? data.map((d) => d["@type"]).filter(Boolean)
            : [data["@type"]].filter(Boolean)

          foundSchemas.push(...schemaType)
        }
      } catch (e) {
        // Invalid JSON-LD, skip
      }
    })

    // Check for important schema types
    const importantSchemas = [
      "Organization",
      "LocalBusiness",
      "Winery",
      "Restaurant",
      "Hotel",
      "FAQPage",
      "Review",
      "Event",
      "BreadcrumbList",
    ]

    const missingSchemas = importantSchemas.filter((schema) => !foundSchemas.includes(schema))

    // Calculate score based on found schemas
    const schemaCount = foundSchemas.length
    let score = 0

    if (schemaCount === 0) {
      score = 0
      details.push("No structured data found")
    } else if (schemaCount < 3) {
      score = 30
      details.push(`Found ${schemaCount} schema type(s)`)
    } else if (schemaCount < 5) {
      score = 60
      details.push(`Found ${schemaCount} schema types`)
    } else {
      score = 90
      details.push(`Found ${schemaCount} schema types - excellent coverage`)
    }

    // Add details about what was found
    if (foundSchemas.length > 0) {
      details.push(`Present: ${foundSchemas.join(", ")}`)
    }

    if (missingSchemas.length > 0) {
      details.push(`Missing: ${missingSchemas.slice(0, 3).join(", ")}`)
    }

    // Determine status
    let status: "good" | "needs-attention" | "critical"
    if (score >= 70) {
      status = "good"
    } else if (score >= 40) {
      status = "needs-attention"
    } else {
      status = "critical"
    }

    return {
      score,
      status,
      details,
      missingSchemas,
      foundSchemas,
    }
  } catch (error) {
    console.error("Schema check error:", error)
    return {
      score: 0,
      status: "critical",
      details: ["Failed to analyze website"],
      missingSchemas: [],
      foundSchemas: [],
    }
  }
}
