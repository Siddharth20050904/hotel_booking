import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Test database connection
    await sql`SELECT 1 as test`

    // Check if users table exists and has the demo user
    const userCheck = await sql`
      SELECT COUNT(*) as count FROM users WHERE email = 'demo@example.com'
    `

    const hasDemo = Number(userCheck[0].count) > 0

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      demoUser: hasDemo ? "exists" : "missing",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Auth health check failed:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
