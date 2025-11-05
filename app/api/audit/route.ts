import { type NextRequest, NextResponse } from "next/server"
import { sql, generateId } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    // Validate URL
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL provided" }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Generate audit ID
    const auditId = generateId()

    console.log(`[v0] Creating audit ${auditId} for ${url}`)

    await sql`
      INSERT INTO audits (
        id, 
        website_url, 
        status, 
        created_at
      ) VALUES (
        ${auditId},
        ${url},
        'processing',
        NOW()
      )
    `

    console.log(`[v0] Audit ${auditId} created successfully`)

    return NextResponse.json({
      auditId,
      status: "processing",
      estimatedTime: 60,
      websiteUrl: url,
    })
  } catch (error) {
    console.error("[v0] Audit creation error:", error)
    return NextResponse.json({ error: "Failed to create audit" }, { status: 500 })
  }
}
