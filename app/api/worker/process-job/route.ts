import { type NextRequest, NextResponse } from "next/server"
import { sql, generateId } from "@/lib/db"
import { testVisibilityWithPerplexity, extractBusinessName, calculateOverallScores } from "@/lib/perplexity"
import { FULL_PROMPT_SET } from "@/lib/prompts"

export const maxDuration = 300 // 5 minutes for long batches
export const runtime = "nodejs" // ensure Node runtime on Vercel
export const dynamic = "force-dynamic" // Add force-dynamic to avoid 405/404 due to cache edge cases

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

  const prompts = FULL_PROMPT_SET.slice(0, 10).map((p) => {
    const text = typeof p === 'string' ? p : (p?.text ?? '')
    if (!text || typeof text !== 'string') {
      console.log('[v0 Debug] Invalid prompt text:', typeof p, p)
      return { text: '', category: 'general' }
    }
    
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
          id, audit_id, prompt, response, mentioned, position, sentiment
        ) VALUES (
          ${generateId()}, ${auditId}, ${r.prompt}, ${r.response},
          ${r.analysis.mentioned}, ${r.analysis.position}, ${r.analysis.sentiment}
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
      frequency_score=${scores.frequency}
    WHERE id=${auditId}
  `

  await sql`UPDATE audit_jobs SET status='completed', progress=100, completed_at=NOW() WHERE id=${jobId}`

  console.log("[Worker] Job completed:", jobId, scores)
  return scores
}

export async function POST(req: NextRequest) {
  const jobId = new URL(req.url).searchParams.get("jobId")
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 })

  console.log("[Worker] POST hit with jobId:", jobId)

  try {
    const scores = await runJob(jobId)
    return NextResponse.json({ ok: true, scores })
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Unknown error"
    console.error("[Worker] Failed:", errorMsg)
    await sql`UPDATE audit_jobs SET status='failed', error_message=${errorMsg}, completed_at=NOW() WHERE id=${jobId}`
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get("jobId")
  return NextResponse.json({ ok: true, expects: "POST", jobId })
}
