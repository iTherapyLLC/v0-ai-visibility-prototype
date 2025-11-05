import { type NextRequest, NextResponse } from "next/server"
import { sql, generateId } from "@/lib/db"
import { FULL_PROMPT_SET } from "@/lib/prompts"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auditId = params.id
    console.log("[v0] Queuing audit job:", auditId)
    
    // Update audit status to processing
    await sql`UPDATE audits SET status = 'processing' WHERE id = ${auditId}`
    
    // Get audit details
    const auditResult = await sql`SELECT * FROM audits WHERE id = ${auditId}`
    
    if (auditResult.length === 0) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 })
    }
    
    // Count total prompts (using first 10 for testing)
    const totalPrompts = Math.min(FULL_PROMPT_SET.length, 10)
    
    // Create job record
    const jobId = generateId()
    await sql`
      INSERT INTO audit_jobs (id, audit_id, status, total_prompts)
      VALUES (${jobId}, ${auditId}, 'queued', ${totalPrompts})
    `
    
    // Trigger background processing by calling worker endpoint
    // Don't await - let it run in background
    const baseUrl = request.url.split("/api/")[0]
    const workerUrl = `${baseUrl}/api/worker/process-job?jobId=${jobId}`
    
    console.log("[v0] Triggering worker at:", workerUrl)
    
    fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).catch((err) => {
      console.error("[v0] Worker trigger failed:", err)
    })
    
    console.log("[v0] Job queued:", jobId)
    
    return NextResponse.json({
      success: true,
      jobId: jobId,
      status: "queued",
      totalPrompts: totalPrompts,
    })
  } catch (error) {
    console.error("[v0] Queue error:", error)
    await sql`UPDATE audits SET status = 'failed' WHERE id = ${params.id}`
    
    return NextResponse.json(
      {
        error: "Failed to queue job",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
