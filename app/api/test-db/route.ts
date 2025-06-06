import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    console.log("🧪 Testing database connection...")

    // Test basic connection
    const connectionTest = await sql`SELECT 1 as test, NOW() as timestamp`
    console.log("✅ Basic connection successful")

    // Check if tables exist
    const tablesCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'hotels', 'rooms', 'bookings', 'reviews')
      ORDER BY table_name
    `

    const tableNames = tablesCheck.map((t) => t.table_name)
    console.log("📋 Found tables:", tableNames)

    // Count records in each table
    const counts = {}
    for (const tableName of tableNames) {
      try {
        const countResult = await sql.unsafe(`SELECT COUNT(*) as count FROM ${tableName}`)
        counts[tableName] = countResult[0].count
      } catch (error) {
        counts[tableName] = `Error: ${error.message}`
      }
    }

    return NextResponse.json({
      status: "success",
      connection: "working",
      timestamp: connectionTest[0].timestamp,
      tables: tableNames,
      counts,
      message: "Database is working properly",
    })
  } catch (error) {
    console.error("❌ Database test failed:", error)
    return NextResponse.json(
      {
        status: "error",
        connection: "failed",
        error: error.message,
        message: "Database connection failed",
      },
      { status: 500 },
    )
  }
}
