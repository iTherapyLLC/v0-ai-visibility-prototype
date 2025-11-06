import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auditId = params.id

    // Fetch audit record
    const auditRows = await sql`
      SELECT 
        id, 
        website_url, 
        status,
        overall_score, 
        citation_score, 
        position_score, 
        sentiment_score, 
        frequency_score,
        citation_count,
        created_at
      FROM audits
      WHERE id = ${auditId}
    `

    if (auditRows.length === 0) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 })
    }

    const audit = auditRows[0]

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
    const promptRows = await sql`
      SELECT 
        prompt, 
        response, 
        mentioned, 
        position, 
        sentiment,
        created_at
      FROM ai_responses
      WHERE audit_id = ${auditId}
      ORDER BY created_at ASC
    `

    const totalPrompts = promptRows.length
    const mentionedIn = promptRows.filter((r: any) => r.mentioned).length

    const response = {
      audit: {
        id: audit.id,
        status: audit.status,
        websiteUrl: audit.website_url,

        overallScore: audit.overall_score ?? 0,
        citationCount: audit.citation_count ?? mentionedIn,

        dimensionScores: {
          citationPresence: audit.citation_score ?? 0,
          position: audit.position_score ?? 0,
          sentiment: audit.sentiment_score ?? 0,
          frequency: audit.frequency_score ?? 0,
        },

        promptResults: {
          totalPrompts,
          mentionedIn,
          prompts: promptRows.map((r: any) => ({
            prompt: r.prompt || "",
            response: r.response || "",
            analysis: {
              mentioned: !!r.mentioned,
              position: r.position,
              sentiment: r.sentiment || "not_mentioned",
            },
          })),
        },
      },
    }

    return NextResponse.json(response, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0",
      },
    })
  } catch (error) {
    console.error("[API] Error fetching audit:", error)
    return NextResponse.json({ error: "Failed to fetch audit data" }, { status: 500 })
  }
}
