import { type NextRequest, NextResponse } from "next/server"
import { sql, generateId } from "@/lib/db"
import type { WinerySpecialty } from "@/lib/prompts"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, specialty = null } = body

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

    const validSpecialties: WinerySpecialty[] = ['cabernet', 'chardonnay', 'pinot', 'sparkling', 'multiple', null]
    const finalSpecialty: WinerySpecialty = validSpecialties.includes(specialty as WinerySpecialty) 
      ? specialty as WinerySpecialty 
      : null

    // Generate audit ID
    const auditId = generateId()

    console.log(`[v0] Creating audit ${auditId} for ${url} with specialty: ${finalSpecialty}`)

    await sql`
      INSERT INTO audits (
        id, 
        website_url, 
        status, 
        specialty,
        created_at
      ) VALUES (
        ${auditId},
        ${url},
        'processing',
        ${finalSpecialty},
        NOW()
      )
    `

    console.log(`[v0] Audit ${auditId} created successfully`)

    return NextResponse.json({
      auditId,
      status: "processing",
      estimatedTime: 60,
      websiteUrl: url,
      specialty: finalSpecialty,
    })
  } catch (error) {
    console.error("[v0] Audit creation error:", error)
    return NextResponse.json({ error: "Failed to create audit" }, { status: 500 })
  }
}
