import type { NextRequest } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { auditId: string } }) {
  try {
    const result = await sql`
      SELECT * FROM audit_jobs 
      WHERE audit_id = ${params.auditId}
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (result.length === 0) {
      return new Response(JSON.stringify({ status: "not_found" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      })
    }

    return new Response(JSON.stringify(result[0]), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    })
  } catch (error) {
    console.error("[v0] Job status error:", error)
    return new Response(JSON.stringify({ error: "Failed to fetch job status" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    })
  }
}
