import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const hotelId = Number.parseInt(params.id)

    const hotel = await sql`
      SELECT * FROM hotels WHERE id = ${hotelId}
    `

    if (hotel.length === 0) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 })
    }

    const rooms = await sql`
      SELECT * FROM rooms WHERE hotel_id = ${hotelId}
    `

    const reviews = await sql`
      SELECT r.*, u.first_name, u.last_name 
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.hotel_id = ${hotelId}
      ORDER BY r.created_at DESC
    `

    return NextResponse.json({
      ...hotel[0],
      rooms,
      reviews,
    })
  } catch (error) {
    console.error("Error fetching hotel:", error)
    return NextResponse.json({ error: "Failed to fetch hotel" }, { status: 500 })
  }
}
