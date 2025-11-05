import { type NextRequest, NextResponse } from "next/server"
import { sql, generateId } from "@/lib/db"
import { testVisibilityWithPerplexity, extractBusinessName, calculateOverallScores } from "@/lib/perplexity"
import { FULL_PROMPT_SET } from "@/lib/prompts"

export const maxDuration = 300 // 5 minutes for worker

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get("jobId")

    if (!jobId) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 })
    }

    console.log("[Worker] Starting job:", jobId)

    // Get job details
    const jobResult = await sql`
      SELECT aj.*, a.website_url 
      FROM audit_jobs aj
      JOIN audits a ON aj.audit_id = a.id
      WHERE aj.id = ${jobId}
    `

    if (jobResult.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    const job = jobResult[0]
    const auditId = job.audit_id
    const websiteUrl = job.website_url

    // Update job status to processing
    await sql`
      UPDATE audit_jobs 
      SET status = 'processing', started_at = NOW() 
      WHERE id = ${jobId}
    `

    // Extract business name
    const businessName = extractBusinessName(websiteUrl)

    console.log("[Worker] Processing:", { auditId, businessName })

    // Get prompts (limit to 10 for testing)
    const prompts = FULL_PROMPT_SET.slice(0, 10).map((text) => {
      // Categorize prompts based on keywords
      let category = "general"
      if (text.toLowerCase().includes("wine") || text.toLowerCase().includes("tasting")) {
        category = "wine_experience"
      } else if (text.toLowerCase().includes("stay") || text.toLowerCase().includes("hotel")) {
        category = "accommodation"
      } else if (text.toLowerCase().includes("restaurant") || text.toLowerCase().includes("food")) {
        category = "dining"
      } else if (text.toLowerCase().includes("tour") || text.toLowerCase().includes("visit")) {
        category = "tours"
      }

      return { text, category }
    })

    const totalPrompts = prompts.length

    console.log(`[Worker] Testing ${totalPrompts} prompts`)

    // Process prompts one at a time with progress updates
    const results = []

    for (let i = 0; i < prompts.length; i++) {
      try {
        const prompt = prompts[i]

        console.log(`[Worker] Prompt ${i + 1}/${totalPrompts}`)

        // Call Perplexity API
        const result = await testVisibilityWithPerplexity(businessName, websiteUrl, prompt.text, prompt.category)

        results.push(result)

        // Store result immediately
        await sql`
          INSERT INTO ai_responses (
            id,
            audit_id,
            platform,
            prompt,
            category,
            response,
            mentioned,
            position,
            sentiment,
            citations,
            citation_sources,
            competitors,
            context,
            detail_score,
            created_at
          ) VALUES (
            ${generateId()},
            ${auditId},
            'perplexity',
            ${result.prompt},
            ${result.category},
            ${result.response},
            ${result.analysis.mentioned},
            ${result.analysis.position},
            ${result.analysis.sentiment},
            ${JSON.stringify(result.citations)},
            ${JSON.stringify(result.analysis.citationSources)},
            ${JSON.stringify(result.analysis.competitors)},
            ${result.analysis.context},
            ${result.detailScore},
            NOW()
          )
        `

        // Update progress
        const progress = Math.round(((i + 1) / totalPrompts) * 100)
        await sql`
          UPDATE audit_jobs 
          SET progress = ${progress}, current_prompt = ${i + 1}
          WHERE id = ${jobId}
        `

        // Rate limiting
        if (i < prompts.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500)) // Reduced delay from 1500ms to 500ms to speed up processing
        }
      } catch (error) {
        console.error(`[Worker] Error on prompt ${i + 1}:`, error)
        // Continue with next prompt
      }
    }

    // Calculate scores
    const scores = calculateOverallScores(results)

    // Update audit with final scores
    await sql`
      UPDATE audits SET
        status = 'completed',
        overall_score = ${scores.overall},
        citation_score = ${scores.citation},
        position_score = ${scores.position},
        sentiment_score = ${scores.sentiment},
        frequency_score = ${scores.frequency},
        citation_count = ${results.filter((r) => r.analysis.mentioned).length},
        completed_at = NOW()
      WHERE id = ${auditId}
    `

    // Update job status
    await sql`
      UPDATE audit_jobs 
      SET status = 'completed', progress = 100, completed_at = NOW()
      WHERE id = ${jobId}
    `

    console.log("[Worker] Job completed:", jobId)

    return NextResponse.json({
      success: true,
      results: results.length,
      scores,
    })
  } catch (error) {
    console.error("[Worker] Processing error:", error)

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get("jobId")

    if (jobId) {
      await sql`
        UPDATE audit_jobs 
        SET status = 'failed', 
            error_message = ${error instanceof Error ? error.message : "Unknown error"},
            completed_at = NOW()
        WHERE id = ${jobId}
      `
    }

    return NextResponse.json(
      {
        error: "Worker failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
