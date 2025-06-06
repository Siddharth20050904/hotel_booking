import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      first_name,
      last_name,
      phone,
      id_type,
      id_number,
      preferred_currency,
      preferred_language,
      newsletter_subscription,
      special_offers,
      room_preferences,
      dietary_restrictions,
    } = body

    const user = await sql`
      INSERT INTO users (
        email, first_name, last_name, phone, id_type, id_number,
        preferred_currency, preferred_language, newsletter_subscription,
        special_offers, room_preferences, dietary_restrictions
      )
      VALUES (
        ${email}, ${first_name}, ${last_name}, ${phone}, ${id_type}, ${id_number},
        ${preferred_currency}, ${preferred_language}, ${newsletter_subscription},
        ${special_offers}, ${room_preferences}, ${dietary_restrictions}
      )
      RETURNING *
    `

    return NextResponse.json(user[0], { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
