import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  console.log("🔍 Hotels API called")

  try {
    // Check database connection first
    console.log("🔌 Testing database connection...")
    await sql`SELECT 1 as test`
    console.log("✅ Database connection successful")

    // Check if hotels table exists
    console.log("🗃️ Checking if hotels table exists...")
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'hotels'
      ) as table_exists
    `

    if (!tableCheck[0].table_exists) {
      console.log("⚠️ Hotels table does not exist")
      return NextResponse.json(
        {
          error: "Database tables do not exist. Please initialize the database first.",
          code: "TABLES_NOT_FOUND",
        },
        { status: 404 },
      )
    }

    console.log("✅ Hotels table exists")

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const location = searchParams.get("location") || "all"
    const minPrice = Number.parseFloat(searchParams.get("minPrice") || "0")
    const maxPrice = Number.parseFloat(searchParams.get("maxPrice") || "1000")
    const coupleFriendly = searchParams.get("coupleFriendly") === "true"

    console.log("📊 Query parameters:", { search, location, minPrice, maxPrice, coupleFriendly })

    // Start with base query
    let hotels

    if (search || location !== "all" || coupleFriendly || minPrice > 0 || maxPrice < 1000) {
      console.log("🎯 Using filtered query")

      // Use a simpler approach with individual conditions
      if (search && location !== "all" && coupleFriendly) {
        hotels = await sql`
          SELECT h.*, 
                 COALESCE(MIN(r.price_per_night), 0) as min_price,
                 COALESCE(MAX(r.price_per_night), 0) as max_price
          FROM hotels h
          LEFT JOIN rooms r ON h.id = r.hotel_id
          WHERE h.name ILIKE ${`%${search}%`}
            AND h.location = ${location}
            AND h.couple_friendly = true
          GROUP BY h.id
          HAVING COALESCE(MIN(r.price_per_night), 0) >= ${minPrice} 
            AND COALESCE(MIN(r.price_per_night), 999999) <= ${maxPrice}
          ORDER BY h.rating DESC
        `
      } else if (search && location !== "all") {
        hotels = await sql`
          SELECT h.*, 
                 COALESCE(MIN(r.price_per_night), 0) as min_price,
                 COALESCE(MAX(r.price_per_night), 0) as max_price
          FROM hotels h
          LEFT JOIN rooms r ON h.id = r.hotel_id
          WHERE h.name ILIKE ${`%${search}%`}
            AND h.location = ${location}
          GROUP BY h.id
          HAVING COALESCE(MIN(r.price_per_night), 0) >= ${minPrice} 
            AND COALESCE(MIN(r.price_per_night), 999999) <= ${maxPrice}
          ORDER BY h.rating DESC
        `
      } else if (search && coupleFriendly) {
        hotels = await sql`
          SELECT h.*, 
                 COALESCE(MIN(r.price_per_night), 0) as min_price,
                 COALESCE(MAX(r.price_per_night), 0) as max_price
          FROM hotels h
          LEFT JOIN rooms r ON h.id = r.hotel_id
          WHERE h.name ILIKE ${`%${search}%`}
            AND h.couple_friendly = true
          GROUP BY h.id
          HAVING COALESCE(MIN(r.price_per_night), 0) >= ${minPrice} 
            AND COALESCE(MIN(r.price_per_night), 999999) <= ${maxPrice}
          ORDER BY h.rating DESC
        `
      } else if (location !== "all" && coupleFriendly) {
        hotels = await sql`
          SELECT h.*, 
                 COALESCE(MIN(r.price_per_night), 0) as min_price,
                 COALESCE(MAX(r.price_per_night), 0) as max_price
          FROM hotels h
          LEFT JOIN rooms r ON h.id = r.hotel_id
          WHERE h.location = ${location}
            AND h.couple_friendly = true
          GROUP BY h.id
          HAVING COALESCE(MIN(r.price_per_night), 0) >= ${minPrice} 
            AND COALESCE(MIN(r.price_per_night), 999999) <= ${maxPrice}
          ORDER BY h.rating DESC
        `
      } else if (search) {
        hotels = await sql`
          SELECT h.*, 
                 COALESCE(MIN(r.price_per_night), 0) as min_price,
                 COALESCE(MAX(r.price_per_night), 0) as max_price
          FROM hotels h
          LEFT JOIN rooms r ON h.id = r.hotel_id
          WHERE h.name ILIKE ${`%${search}%`}
          GROUP BY h.id
          HAVING COALESCE(MIN(r.price_per_night), 0) >= ${minPrice} 
            AND COALESCE(MIN(r.price_per_night), 999999) <= ${maxPrice}
          ORDER BY h.rating DESC
        `
      } else if (location !== "all") {
        hotels = await sql`
          SELECT h.*, 
                 COALESCE(MIN(r.price_per_night), 0) as min_price,
                 COALESCE(MAX(r.price_per_night), 0) as max_price
          FROM hotels h
          LEFT JOIN rooms r ON h.id = r.hotel_id
          WHERE h.location = ${location}
          GROUP BY h.id
          HAVING COALESCE(MIN(r.price_per_night), 0) >= ${minPrice} 
            AND COALESCE(MIN(r.price_per_night), 999999) <= ${maxPrice}
          ORDER BY h.rating DESC
        `
      } else if (coupleFriendly) {
        hotels = await sql`
          SELECT h.*, 
                 COALESCE(MIN(r.price_per_night), 0) as min_price,
                 COALESCE(MAX(r.price_per_night), 0) as max_price
          FROM hotels h
          LEFT JOIN rooms r ON h.id = r.hotel_id
          WHERE h.couple_friendly = true
          GROUP BY h.id
          HAVING COALESCE(MIN(r.price_per_night), 0) >= ${minPrice} 
            AND COALESCE(MIN(r.price_per_night), 999999) <= ${maxPrice}
          ORDER BY h.rating DESC
        `
      } else {
        // Price filter only
        hotels = await sql`
          SELECT h.*, 
                 COALESCE(MIN(r.price_per_night), 0) as min_price,
                 COALESCE(MAX(r.price_per_night), 0) as max_price
          FROM hotels h
          LEFT JOIN rooms r ON h.id = r.hotel_id
          GROUP BY h.id
          HAVING COALESCE(MIN(r.price_per_night), 0) >= ${minPrice} 
            AND COALESCE(MIN(r.price_per_night), 999999) <= ${maxPrice}
          ORDER BY h.rating DESC
        `
      }
    } else {
      console.log("📋 Using simple query for all hotels")
      hotels = await sql`
        SELECT h.*, 
               COALESCE(MIN(r.price_per_night), 0) as min_price,
               COALESCE(MAX(r.price_per_night), 0) as max_price
        FROM hotels h
        LEFT JOIN rooms r ON h.id = r.hotel_id
        GROUP BY h.id
        ORDER BY h.rating DESC
      `
    }

    console.log(`✅ Query successful, found ${hotels.length} hotels`)

    // Ensure we return a proper array
    const hotelsArray = Array.isArray(hotels) ? hotels : []

    return NextResponse.json(hotelsArray)
  } catch (error) {
    console.error("❌ Error in hotels API:", error)

    // Return a proper JSON error response
    return NextResponse.json(
      {
        error: "Failed to fetch hotels",
        details: error.message,
        code: "API_ERROR",
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
    return NextResponse.json(
      {
        error: "Failed to create hotel",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
