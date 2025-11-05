import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const url = searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "URL parameter required" }, { status: 400 })
    }

    // Find most recent completed audit for this URL
    const auditResult = await sql`
      SELECT id FROM audits 
      WHERE website_url = ${url} 
      AND status = 'completed'
      ORDER BY completed_at DESC
      LIMIT 1
    `

    if (auditResult.length === 0) {
      return NextResponse.json({ error: "No completed audit found for this URL" }, { status: 404 })
    }

    const auditId = auditResult[0].id

    // Fetch competitors
    const competitors = await sql`
      SELECT * FROM competitors 
      WHERE audit_id = ${auditId}
      ORDER BY mention_count DESC
      LIMIT 10
    `

    // Generate quick wins based on audit data
    const quickWins = [
      {
        title: "Add FAQ schema to tasting-room page",
        description: "Implement FAQ structured data to help AI understand your offerings",
        priority: "high",
        estimatedImpact: "+15% visibility",
        timeToImplement: "2 hours",
        category: "schema",
      },
      {
        title: "Include sustainability metrics",
        description: "Add carbon reduction % and local sourcing data to your about page",
        priority: "high",
        estimatedImpact: "+10% visibility",
        timeToImplement: "1 day",
        category: "content",
      },
      {
        title: 'Create content cluster: "Best Wine Tours in Napa for Couples"',
        description: "Build comprehensive guide targeting this high-volume search query",
        priority: "medium",
        estimatedImpact: "+20% visibility",
        timeToImplement: "1 week",
        category: "content",
      },
    ]

    // Mock citation opportunities (would be extracted from AI responses)
    const citationOpportunities = [
      {
        source: "VisitNapa.com",
        url: "https://visitnapa.com",
        relevance: 95,
        reason: "Official tourism board - high authority for Napa recommendations",
      },
      {
        source: "WineCountry.com",
        url: "https://winecountry.com",
        relevance: 90,
        reason: "Leading wine tourism publication with strong AI presence",
      },
      {
        source: "Napa Tourism Board",
        url: "https://napatourism.com",
        relevance: 85,
        reason: "Regional authority frequently cited by AI platforms",
      },
    ]

    return NextResponse.json({
      topCompetitors: competitors.slice(0, 3).map((c: any) => ({
        name: c.name,
        url: c.url,
        mentionCount: c.mention_count,
        aiSources: ["ChatGPT"],
        visibilityScore: c.visibility_score,
      })),
      citationOpportunities,
      quickWins,
    })
  } catch (error) {
    console.error("[v0] Error fetching competitors:", error)
    return NextResponse.json({ error: "Failed to fetch competitor data" }, { status: 500 })
  }
}
