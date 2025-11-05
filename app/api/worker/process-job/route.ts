import { type NextRequest, NextResponse } from "next/server"
import { sql, generateId } from "@/lib/db"
import { testVisibilityWithPerplexity, extractBusinessName, calculateOverallScores } from "@/lib/perplexity"
import { FULL_PROMPT_SET } from "@/lib/prompts"

export const maxDuration = 300 // 5 minutes for long batches
export const runtime = "nodejs" // ensure Node runtime on Vercel

async function runJob(jobId: string) {
  const rows = await sql`
    SELECT aj.id, aj.audit_id, aj.total_prompts, a.website_url
    FROM audit_jobs aj
    JOIN audits a ON a.id = aj.audit_id
    WHERE aj.id = ${jobId}
  `
  if (rows.length === 0) throw new Error("Job not found")

  const job = rows[0]
  const auditId = job.audit_id as string
  const websiteUrl = job.website_url as string

  await sql`UPDATE audit_jobs SET status='processing', started_at=NOW(), progress=0 WHERE id=${jobId}`

  const businessName = extractBusinessName(websiteUrl)
  console.log("[Worker] Start:", { jobId, auditId, businessName })

  const prompts = FULL_PROMPT_SET.slice(0, 10).map((text) => {
    let category = "general"
    const t = text.toLowerCase()
    if (t.includes("romantic")) category = "occasion"
    else if (t.includes("family")) category = "family"
    else if (t.includes("best") || t.includes("first-time")) category = "discovery"
    else if (t.includes("compare")) category = "comparison"
    else if (t.includes("reservation") || t.includes("same-day")) category = "practical"
    return { text, category }
  })

  const total = prompts.length
  const results: any[] = []

  for (let i = 0; i < total; i++) {
    try {
      const p = prompts[i]

      const r = await testVisibilityWithPerplexity(businessName, websiteUrl, p.text, p.category)
      results.push(r)

      await sql`
        INSERT INTO ai_responses (
          id, audit_id, platform, prompt, category, response,
          mentioned, position, sentiment, citations, citation_sources,
          competitors, context, detail_score, created_at
        ) VALUES (
          ${generateId()}, ${auditId}, 'perplexity', ${r.prompt}, ${r.category}, ${r.response},
          ${r.analysis.mentioned}, ${r.analysis.position}, ${r.analysis.sentiment},
          ${JSON.stringify(r.citations)}, ${JSON.stringify(r.analysis.citationSources)},
          ${JSON.stringify(r.analysis.competitors)}, ${r.analysis.context}, ${r.detailScore}, NOW()
        )
      `

      const progress = Math.round(((i + 1) / total) * 100)
      await sql`UPDATE audit_jobs SET progress=${progress}, current_prompt=${i + 1} WHERE id=${jobId}`

      if (i < total - 1) await new Promise((res) => setTimeout(res, 500))
    } catch (err) {
      console.error(`[Worker] Error on prompt ${i + 1}:`, err)
      // continue processing other prompts
    }
  }

  const scores = calculateOverallScores(results)
  await sql`
    UPDATE audits SET
      status='completed',
      overall_score=${scores.overall},
      citation_score=${scores.citation},
      position_score=${scores.position},
      sentiment_score=${scores.sentiment},
      frequency_score=${scores.frequency},
      completed_at=NOW()
    WHERE id=${auditId}
  `

  await sql`UPDATE audit_jobs SET status='completed', progress=100, completed_at=NOW() WHERE id=${jobId}`

  console.log("[Worker] Job completed:", jobId, scores)
  return scores
}

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get("jobId")
  return NextResponse.json({ ok: true, expects: "POST", jobId })
}
