import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set")
  console.error(
    "Available environment variables:",
    Object.keys(process.env).filter((key) => key.includes("DATABASE") || key.includes("POSTGRES")),
  )
  throw new Error("DATABASE_URL environment variable is not set")
}

console.log("🔌 Initializing database connection...")
console.log("📍 Database URL prefix:", process.env.DATABASE_URL.substring(0, 30) + "...")

export const sql = neon(process.env.DATABASE_URL)

// Create a wrapper function for safer database operations
export async function safeSql(query: any, ...params: any[]) {
  try {
    if (typeof query === "string") {
      return await sql.unsafe(query, params)
    } else {
      return await query
    }
  } catch (error) {
    console.error("❌ Database query failed:", error.message)
    throw new Error(`Database operation failed: ${error.message}`)
  }
}

// Test the connection but don't block the app
console.log("🧪 Testing initial database connection...")
sql`SELECT 1 as test, NOW() as timestamp`
  .then((result) => {
    console.log("✅ Initial database connection successful")
    console.log("🕐 Server time:", result[0].timestamp)
  })
  .catch((error) => {
    console.error("❌ Initial database connection failed:", error.message)
    console.log("ℹ️ This is normal if the database hasn't been set up yet")
  })
