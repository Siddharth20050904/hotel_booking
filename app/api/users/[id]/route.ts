import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)

    const user = await sql`
      SELECT * FROM users WHERE id = ${userId}
    `

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user[0])
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)
    const body = await request.json()

    const user = await sql`
      UPDATE users 
      SET 
        first_name = ${body.first_name},
        last_name = ${body.last_name},
        phone = ${body.phone},
        id_type = ${body.id_type},
        id_number = ${body.id_number},
        preferred_currency = ${body.preferred_currency},
        preferred_language = ${body.preferred_language},
        newsletter_subscription = ${body.newsletter_subscription},
        special_offers = ${body.special_offers},
        room_preferences = ${body.room_preferences},
        dietary_restrictions = ${body.dietary_restrictions},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
      RETURNING *
    `

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user[0])
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
