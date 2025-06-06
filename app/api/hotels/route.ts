import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const location = searchParams.get("location") || ""
    const minPrice = Number.parseFloat(searchParams.get("minPrice") || "0")
    const maxPrice = Number.parseFloat(searchParams.get("maxPrice") || "1000")
    const coupleFriendly = searchParams.get("coupleFriendly") === "true"

    // First check if tables exist
    try {
      await sql`SELECT 1 FROM hotels LIMIT 1`
    } catch (tableError) {
      return NextResponse.json(
        {
          error: "Database tables do not exist. Please initialize the database first.",
          code: "TABLES_NOT_FOUND",
        },
        { status: 404 },
      )
    }

    let hotels

    if (search || location !== "all" || coupleFriendly || minPrice > 0 || maxPrice < 1000) {
      // Build filtered query
      const whereConditions = []

      if (search) {
        whereConditions.push(`h.name ILIKE '%${search}%'`)
      }

      if (location && location !== "all") {
        whereConditions.push(`h.location = '${location}'`)
      }

      if (coupleFriendly) {
        whereConditions.push(`h.couple_friendly = true`)
      }

      const whereClause = whereConditions.length > 0 ? `AND ${whereConditions.join(" AND ")}` : ""

      hotels = await sql`
        SELECT h.*, 
               MIN(r.price_per_night) as min_price,
               MAX(r.price_per_night) as max_price
        FROM hotels h
        LEFT JOIN rooms r ON h.id = r.hotel_id
        WHERE 1=1 ${sql.unsafe(whereClause)}
        GROUP BY h.id
        HAVING MIN(r.price_per_night) >= ${minPrice} 
        AND MIN(r.price_per_night) <= ${maxPrice}
        ORDER BY h.rating DESC
      `
    } else {
      // Get all hotels without filters
      hotels = await sql`
        SELECT h.*, 
               MIN(r.price_per_night) as min_price,
               MAX(r.price_per_night) as max_price
        FROM hotels h
        LEFT JOIN rooms r ON h.id = r.hotel_id
        GROUP BY h.id
        ORDER BY h.rating DESC
      `
    }

    return NextResponse.json(hotels)
  } catch (error) {
    console.error("Error fetching hotels:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch hotels. Database may not be initialized.",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, location, address, city, country, amenities, couple_friendly, image_url } = body

    const result = await sql`
      INSERT INTO hotels (name, description, location, address, city, country, amenities, couple_friendly, image_url)
      VALUES (${name}, ${description}, ${location}, ${address}, ${city}, ${country}, ${amenities}, ${couple_friendly}, ${image_url})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating hotel:", error)
    return NextResponse.json({ error: "Failed to create hotel" }, { status: 500 })
  }
}
