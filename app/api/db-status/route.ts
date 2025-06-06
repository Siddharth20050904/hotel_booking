import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    console.log("🔍 Checking database status...")

    // Test basic connection
    const connectionTest = await sql`SELECT 1 as test, NOW() as current_time`
    console.log("✅ Database connection working")

    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `

    const tableNames = tables.map((t) => t.table_name)
    console.log("📋 Found tables:", tableNames)

    // Check required tables
    const requiredTables = ["users", "hotels", "rooms", "bookings", "reviews"]
    const missingTables = requiredTables.filter((table) => !tableNames.includes(table))

    const counts = {}
    if (missingTables.length === 0) {
      // Get counts for each table
      for (const table of requiredTables) {
        try {
          const result = await sql.unsafe(`SELECT COUNT(*) as count FROM ${table}`)
          counts[table] = Number(result[0].count)
        } catch (error) {
          counts[table] = `Error: ${error.message}`
        }
      }
    }

    return NextResponse.json({
      status: "success",
      connection: "working",
      timestamp: connectionTest[0].current_time,
      allTables: tableNames,
      requiredTables,
      missingTables,
      tablesReady: missingTables.length === 0,
      counts,
    })
  } catch (error) {
    console.error("❌ Database status check failed:", error)

    return NextResponse.json(
      {
        status: "error",
        connection: "failed",
        error: error.message,
        name: error.name,
        code: error.code,
      },
      { status: 500 },
    )
  }
}
