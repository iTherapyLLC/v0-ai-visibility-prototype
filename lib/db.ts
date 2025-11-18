import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// Create a SQL client using Neon's serverless driver
export const sql = neon(process.env.DATABASE_URL)

// Database schema types
export interface Audit {
  id: string
  website_url: string
  status: "processing" | "completed" | "failed"
  overall_score: number | null
  created_at: string
  specialty: string | null
  schema_health_score: number | null
  speed_performance_score: number | null
  citation_count: number | null
  citation_score: number | null
  position_score: number | null
  sentiment_score: number | null
  frequency_score: number | null
}

export interface AIResponse {
  id: string
  audit_id: string
  prompt: string
  response: string
  mentioned: boolean
  position: number | null
  sentiment: "positive" | "neutral" | "negative" | "not_mentioned"
  created_at: string
}

export interface Competitor {
  id: string
  audit_id: string
  name: string
  url: string | null
  mention_count: number
  visibility_score: number | null
}

export interface Recommendation {
  id: string
  audit_id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  category: "schema" | "speed" | "content" | "citations"
  estimated_impact: string
}

// Helper function to generate UUID
export function generateId(): string {
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  // Fallback for older environments
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
