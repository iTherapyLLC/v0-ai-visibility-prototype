import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auditId = params.id

    // Fetch audit record
    const auditResult = await sql`
      SELECT * FROM audits WHERE id = ${auditId}
    `

    if (auditResult.length === 0) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 })
    }

    const audit = auditResult[0]

    // If still processing, return status
    if (audit.status === "processing") {
      return NextResponse.json({
        auditId: audit.id,
        websiteUrl: audit.website_url,
        status: "processing",
        timestamp: audit.created_at,
      })
    }

    // If failed, return error
    if (audit.status === "failed") {
      return NextResponse.json({
        auditId: audit.id,
        websiteUrl: audit.website_url,
        status: "failed",
        timestamp: audit.created_at,
      })
    }

    // Fetch AI responses
    const aiResponses = await sql`
      SELECT * FROM ai_responses WHERE audit_id = ${auditId}
    `

    // Calculate simple projected visibility (current + 30% improvement potential)
    const currentVisibility = audit.overall_score || 0
    const projectedVisibility = Math.min(100, currentVisibility + 30)

    const response = {
      auditId: audit.id,
      websiteUrl: audit.website_url,
      status: audit.status,
      timestamp: audit.completed_at,
      overallScore: audit.overall_score || 0,

      metrics: {
        schemaHealth: {
          score: audit.schema_health_score || 0,
          status:
            (audit.schema_health_score || 0) >= 70
              ? "good"
              : (audit.schema_health_score || 0) >= 40
                ? "needs-attention"
                : "critical",
          details: ["Schema analysis pending"],
          missingSchemas: [],
        },
        speedPerformance: {
          score: audit.speed_performance_score || 0,
          status:
            (audit.speed_performance_score || 0) >= 70
              ? "good"
              : (audit.speed_performance_score || 0) >= 40
                ? "needs-attention"
                : "critical",
        },
        citationMentions: {
          count: audit.citation_count || 0,
          sources: [],
        },
      },

      aiVisibility: {
        chatgpt: {
          before: currentVisibility,
          after: projectedVisibility,
          mentionCount: audit.citation_count || 0,
          totalPrompts: aiResponses.length,
        },
        perplexity: {
          before: 0,
          after: 0,
          mentionCount: 0,
          totalPrompts: 0,
        },
        gemini: {
          before: 0,
          after: 0,
          mentionCount: 0,
          totalPrompts: 0,
        },
      },

      promptResults: {
        totalPrompts: aiResponses.length,
        mentionedIn: audit.citation_count || 0,
        prompts: aiResponses.map((r: any) => ({
          id: r.id,
          text: r.prompt,
          platform: r.platform,
          mentioned: r.mentioned,
          context: r.response ? r.response.substring(0, 200) : "",
        })),
      },

      recommendations: [
        {
          id: "1",
          title: "Improve Schema Markup",
          description: "Add structured data to help AI systems understand your business better",
          priority: "high",
          category: "schema",
          estimatedImpact: "30% visibility increase",
        },
        {
          id: "2",
          title: "Optimize Page Speed",
          description: "Faster loading times improve your chances of being recommended by AI",
          priority: "medium",
          category: "speed",
          estimatedImpact: "15% visibility increase",
        },
      ],
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] Error fetching audit:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch audit",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
