import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { auditId: string } }) {
  try {
    const result = await sql`
      SELECT * FROM audit_jobs 
      WHERE audit_id = ${params.auditId}
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (result.length === 0) {
      return NextResponse.json({ status: "not_found" })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("[v0] Job status error:", error)
    return NextResponse.json({ error: "Failed to fetch job status" }, { status: 500 })
  }
}
