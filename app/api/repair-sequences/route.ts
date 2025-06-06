import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST() {
  try {
    console.log("🔧 Repairing database sequences...")

    // Reset all sequences to match the current max IDs
    await sql`
      SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1), false)
    `

    await sql`
      SELECT setval('hotels_id_seq', COALESCE((SELECT MAX(id) FROM hotels), 1), false)
    `

    await sql`
      SELECT setval('rooms_id_seq', COALESCE((SELECT MAX(id) FROM rooms), 1), false)
    `

    await sql`
      SELECT setval('bookings_id_seq', COALESCE((SELECT MAX(id) FROM bookings), 1), false)
    `

    await sql`
      SELECT setval('reviews_id_seq', COALESCE((SELECT MAX(id) FROM reviews), 1), false)
    `

    // Get current sequence values
    const sequences = await sql`
      SELECT 
        'users_id_seq' as sequence_name,
        last_value as current_value
      FROM users_id_seq
      UNION ALL
      SELECT 
        'hotels_id_seq' as sequence_name,
        last_value as current_value
      FROM hotels_id_seq
      UNION ALL
      SELECT 
        'rooms_id_seq' as sequence_name,
        last_value as current_value
      FROM rooms_id_seq
      UNION ALL
      SELECT 
        'bookings_id_seq' as sequence_name,
        last_value as current_value
      FROM bookings_id_seq
      UNION ALL
      SELECT 
        'reviews_id_seq' as sequence_name,
        last_value as current_value
      FROM reviews_id_seq
    `

    console.log("✅ Database sequences repaired")

    return NextResponse.json({
      success: true,
      message: "Database sequences repaired successfully",
      sequences: sequences,
    })
  } catch (error) {
    console.error("❌ Error repairing sequences:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to repair sequences",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
