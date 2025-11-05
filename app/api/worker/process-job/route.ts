import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { FULL_PROMPT_SET } from "@/lib/prompts"
import { testVisibilityWithPerplexity } from "@/lib/perplexity"

export const maxDuration = 300

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get("jobId")

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId parameter" }, { status: 400 })
    }

    console.log("[v0] Worker processing job:", jobId)

    // Get job details
    const jobResult = await sql`SELECT * FROM audit_jobs WHERE id = ${jobId}`

    if (jobResult.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    const job = jobResult[0]
    const auditId = job.audit_id

    // Update job status to processing
    await sql`UPDATE audit_jobs SET status = 'processing', started_at = NOW() WHERE id = ${jobId}`

    // Get audit details
    const auditResult = await sql`SELECT * FROM audits WHERE id = ${auditId}`

    if (auditResult.length === 0) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 })
    }

    const audit = auditResult[0]
    const businessName = audit.business_name

    // Use first 10 prompts for testing
    const promptsToTest = FULL_PROMPT_SET.slice(0, 10)
    const totalPrompts = promptsToTest.length

    console.log(`[v0] Testing ${totalPrompts} prompts for ${businessName}`)

    let citationScore = 0
    let positionScore = 0
    let sentimentScore = 0
    let frequencyScore = 0
    let totalMentions = 0

    // Process each prompt
    for (let i = 0; i < promptsToTest.length; i++) {
      const prompt = promptsToTest[i]
      const promptNumber = i + 1

      console.log(`[v0] Testing prompt ${promptNumber}/${totalPrompts}`)

      // Update job progress
      await sql`
        UPDATE audit_jobs 
        SET 
          prompts_completed = ${promptNumber},
          current_prompt = ${prompt.text}
        WHERE id = ${jobId}
      `

      try {
        // Test visibility with Perplexity
        const result = await testVisibilityWithPerplexity(businessName, prompt.text)

        // Store the result
        await sql`
          INSERT INTO ai_responses (
            audit_id,
            prompt_id,
            prompt_text,
            response_text,
            mentioned,
            category,
            position,
            sentiment,
            citations,
            citation_sources,
            context,
            detail_score
          ) VALUES (
            ${auditId},
            ${prompt.id},
            ${prompt.text},
            ${result.response},
            ${result.analysis.mentioned},
            ${result.analysis.category},
            ${result.analysis.position},
            ${result.analysis.sentiment},
            ${JSON.stringify(result.analysis.citations)},
            ${JSON.stringify(result.analysis.citationSources)},
            ${result.analysis.context || ""},
            ${result.analysis.detailScore}
          )
        `

        // Accumulate scores
        if (result.analysis.mentioned) {
          totalMentions++

          // Citation score (0-25 points)
          if (result.analysis.category === "direct") citationScore += 2.5
          else if (result.analysis.category === "indirect") citationScore += 1.5
          else if (result.analysis.category === "contextual") citationScore += 0.5

          // Position score (0-35 points)
          if (result.analysis.position === 1) positionScore += 3.5
          else if (result.analysis.position === 2) positionScore += 2.5
          else if (result.analysis.position === 3) positionScore += 1.5
          else if (result.analysis.position && result.analysis.position <= 5) positionScore += 0.5

          // Sentiment score (0-25 points)
          if (result.analysis.sentiment === "positive") sentimentScore += 2.5
          else if (result.analysis.sentiment === "neutral") sentimentScore += 1.5

          // Frequency score (0-15 points)
          frequencyScore += 1.5
        }

        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (error) {
        console.error(`[v0] Error testing prompt ${promptNumber}:`, error)
        // Continue with next prompt even if one fails
      }
    }

    // Calculate overall score (0-100)
    const overallScore = Math.round(citationScore + positionScore + sentimentScore + frequencyScore)

    console.log(
      `[v0] Final scores - Overall: ${overallScore}, Citation: ${citationScore}, Position: ${positionScore}, Sentiment: ${sentimentScore}, Frequency: ${frequencyScore}`,
    )

    // Update audit with final scores
    await sql`
      UPDATE audits 
      SET 
        status = 'completed',
        overall_score = ${overallScore},
        citation_score = ${citationScore},
        position_score = ${positionScore},
        sentiment_score = ${sentimentScore},
        frequency_score = ${frequencyScore},
        completed_at = NOW()
      WHERE id = ${auditId}
    `

    // Update job status to completed
    await sql`
      UPDATE audit_jobs 
      SET 
        status = 'completed',
        completed_at = NOW()
      WHERE id = ${jobId}
    `

    console.log(`[v0] Job completed: ${jobId}`)

    return NextResponse.json({
      success: true,
      jobId: jobId,
      auditId: auditId,
      overallScore: overallScore,
      totalMentions: totalMentions,
      totalPrompts: totalPrompts,
    })
  } catch (error) {
    console.error("[v0] Worker error:", error)

    // Try to update job status to failed
    try {
      const { searchParams } = new URL(request.url)
      const jobId = searchParams.get("jobId")
      if (jobId) {
        await sql`UPDATE audit_jobs SET status = 'failed' WHERE id = ${jobId}`
      }
    } catch (updateError) {
      console.error("[v0] Failed to update job status:", updateError)
    }

    return NextResponse.json(
      {
        error: "Worker processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
