import { type NextRequest, NextResponse } from "next/server"

// GEO_AUTHORIZED_USERS format: "email1:password1,email2:password2"
function getAuthorizedUsers(): Map<string, string> {
  const users = new Map<string, string>()
  const envUsers = process.env.GEO_AUTHORIZED_USERS

  if (!envUsers) {
    console.warn("[Auth] GEO_AUTHORIZED_USERS not configured")
    return users
  }

  // Parse comma-separated user:password pairs
  const pairs = envUsers.split(",")
  for (const pair of pairs) {
    const [email, password] = pair.trim().split(":")
    if (email && password) {
      users.set(email.toLowerCase().trim(), password.trim())
    }
  }

  return users
}

// Simple token generation - in production, use JWT or a proper session system
function generateToken(email: string): string {
  const timestamp = Date.now()
  const randomPart = Math.random().toString(36).substring(2, 15)
  // Base64 encode the token data
  const tokenData = JSON.stringify({ email, timestamp, random: randomPart })
  return Buffer.from(tokenData).toString("base64")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const authorizedUsers = getAuthorizedUsers()

    // Check if no users are configured
    if (authorizedUsers.size === 0) {
      console.error("[Auth] No authorized users configured")
      return NextResponse.json(
        { error: "Authentication service not configured" },
        { status: 503 }
      )
    }

    // Validate credentials
    const storedPassword = authorizedUsers.get(normalizedEmail)

    if (!storedPassword || storedPassword !== password) {
      console.log(`[Auth] Failed login attempt for: ${normalizedEmail}`)
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Generate token
    const token = generateToken(normalizedEmail)

    console.log(`[Auth] Successful login for: ${normalizedEmail}`)

    return NextResponse.json({
      success: true,
      token,
      email: normalizedEmail,
    })
  } catch (error) {
    console.error("[Auth] Login error:", error)
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    )
  }
}

// Optional: Token validation endpoint
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { valid: false, error: "No token provided" },
      { status: 401 }
    )
  }

  const token = authHeader.substring(7)

  try {
    // Decode and validate token
    const tokenData = JSON.parse(Buffer.from(token, "base64").toString())
    const { email, timestamp } = tokenData

    // Check if token is expired (24 hours)
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    if (Date.now() - timestamp > maxAge) {
      return NextResponse.json(
        { valid: false, error: "Token expired" },
        { status: 401 }
      )
    }

    // Verify user still exists in authorized list
    const authorizedUsers = getAuthorizedUsers()
    if (!authorizedUsers.has(email)) {
      return NextResponse.json(
        { valid: false, error: "User no longer authorized" },
        { status: 401 }
      )
    }

    return NextResponse.json({ valid: true, email })
  } catch {
    return NextResponse.json(
      { valid: false, error: "Invalid token" },
      { status: 401 }
    )
  }
}
