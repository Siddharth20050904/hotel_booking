import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const bookings = await sql`
      SELECT b.*, h.name as hotel_name, h.image_url, r.room_type
      FROM bookings b
      JOIN hotels h ON b.hotel_id = h.id
      JOIN rooms r ON b.room_id = r.id
      WHERE b.user_id = ${Number.parseInt(userId)}
      ORDER BY b.created_at DESC
    `

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/bookings called")

    const body = await request.json()
    console.log("Request body:", body)

    const { user_id, hotel_id, room_id, check_in_date, check_out_date, guests, total_price, special_requests } = body

    // Validate required fields
    if (!user_id || !hotel_id || !room_id || !check_in_date || !check_out_date || !guests || !total_price) {
      console.log("Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user exists, if not create a demo user
    console.log("Checking if user exists:", user_id)
    const userCheck = await sql`
      SELECT id FROM users WHERE id = ${user_id}
    `

    if (userCheck.length === 0) {
      console.log("User not found, creating demo user...")
      await sql`
        INSERT INTO users (id, email, first_name, last_name, phone, id_type, id_number, preferred_currency, preferred_language) 
        VALUES (${user_id}, 'demo@example.com', 'Demo', 'User', '+1-555-0123', 'passport', 'AB123456', 'USD', 'english')
        ON CONFLICT (email) DO UPDATE SET id = ${user_id}
      `
      console.log("Demo user created")
    }

    // Check room availability
    console.log("Checking room availability for room_id:", room_id)
    const room = await sql`
      SELECT available_rooms FROM rooms WHERE id = ${room_id}
    `

    console.log("Room availability result:", room)

    if (room.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    if (room[0].available_rooms < 1) {
      return NextResponse.json({ error: "Room not available" }, { status: 400 })
    }

    // Create booking
    console.log("Creating booking...")
    const booking = await sql`
      INSERT INTO bookings (user_id, hotel_id, room_id, check_in_date, check_out_date, guests, total_price, special_requests, status)
      VALUES (${user_id}, ${hotel_id}, ${room_id}, ${check_in_date}, ${check_out_date}, ${guests}, ${total_price}, ${special_requests || ""}, 'confirmed')
      RETURNING *
    `

    console.log("Booking created:", booking[0])

    // Update room availability
    console.log("Updating room availability...")
    await sql`
      UPDATE rooms 
      SET available_rooms = available_rooms - 1 
      WHERE id = ${room_id}
    `

    console.log("Room availability updated")

    return NextResponse.json(booking[0], { status: 201 })
  } catch (error) {
    console.error("Error creating booking:", error)

    // Check if it's a foreign key constraint error
    if (error.message && error.message.includes("foreign key constraint")) {
      return NextResponse.json(
        {
          error: "Database constraint error. Please ensure the database is properly initialized.",
          details: "Try clicking 'Initialize Database' on the homepage first.",
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to create booking",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
