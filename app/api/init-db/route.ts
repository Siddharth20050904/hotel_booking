import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST() {
  console.log("🚀 Starting database initialization...")

  try {
    // Test connection first
    console.log("🔌 Testing database connection...")
    await sql`SELECT 1 as test`
    console.log("✅ Database connection successful")

    // Create users table
    console.log("👥 Creating users table...")
    await sql`
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          phone VARCHAR(20),
          id_type VARCHAR(50),
          id_number VARCHAR(100),
          preferred_currency VARCHAR(3) DEFAULT 'USD',
          preferred_language VARCHAR(50) DEFAULT 'english',
          newsletter_subscription BOOLEAN DEFAULT true,
          special_offers BOOLEAN DEFAULT true,
          room_preferences TEXT,
          dietary_restrictions TEXT,
          password VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("✅ Users table created")

    // Create hotels table
    console.log("🏨 Creating hotels table...")
    await sql`
      CREATE TABLE IF NOT EXISTS hotels (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          location VARCHAR(255) NOT NULL,
          address TEXT,
          city VARCHAR(100),
          country VARCHAR(100),
          latitude DECIMAL(10, 8),
          longitude DECIMAL(11, 8),
          rating DECIMAL(2, 1) DEFAULT 0,
          total_reviews INTEGER DEFAULT 0,
          amenities TEXT[],
          couple_friendly BOOLEAN DEFAULT false,
          image_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("✅ Hotels table created")

    // Create rooms table
    console.log("🛏️ Creating rooms table...")
    await sql`
      CREATE TABLE IF NOT EXISTS rooms (
          id SERIAL PRIMARY KEY,
          hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE,
          room_type VARCHAR(100) NOT NULL,
          description TEXT,
          price_per_night DECIMAL(10, 2) NOT NULL,
          max_occupancy INTEGER NOT NULL,
          amenities TEXT[],
          image_url TEXT,
          total_rooms INTEGER DEFAULT 1,
          available_rooms INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("✅ Rooms table created")

    // Create bookings table
    console.log("📅 Creating bookings table...")
    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE,
          room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
          check_in_date DATE NOT NULL,
          check_out_date DATE NOT NULL,
          guests INTEGER NOT NULL,
          total_price DECIMAL(10, 2) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          special_requests TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("✅ Bookings table created")

    // Create reviews table
    console.log("⭐ Creating reviews table...")
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE,
          booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
          rating INTEGER CHECK (rating >= 1 AND rating <= 5),
          title VARCHAR(255),
          comment TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("✅ Reviews table created")

    // Check if data already exists
    console.log("📊 Checking existing data...")
    const existingUsers = await sql`SELECT COUNT(*) as count FROM users`
    const existingHotels = await sql`SELECT COUNT(*) as count FROM hotels`

    console.log(`Found ${existingUsers[0].count} users and ${existingHotels[0].count} hotels`)

    // Insert demo user if none exists
    if (Number(existingUsers[0].count) === 0) {
      console.log("👤 Creating demo user...")
      await sql`
        INSERT INTO users (email, first_name, last_name, phone, id_type, id_number, preferred_currency, preferred_language, password) 
        VALUES ('demo@example.com', 'Demo', 'User', '+1-555-0123', 'passport', 'AB123456', 'USD', 'english', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBMY9f5zqiUm4W')
      `
      console.log("✅ Demo user created")
    } else {
      console.log("ℹ️ Demo user already exists")
    }

    // Insert sample hotels if none exist
    if (Number(existingHotels[0].count) === 0) {
      console.log("🏨 Inserting sample hotels...")

      // Insert hotels one by one to avoid complex array syntax issues
      const hotelData = [
        {
          name: "Grand Plaza Hotel",
          description: "Luxury hotel in the heart of downtown with world-class amenities",
          location: "Downtown",
          address: "123 Main Street",
          city: "New York",
          country: "USA",
          rating: 4.5,
          total_reviews: 1250,
          amenities: ["Free WiFi", "Pool", "Spa", "Gym", "Restaurant"],
          couple_friendly: true,
          image_url:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiPkdyYW5kIFBsYXphPC90ZXh0Pgo8L3N2Zz4K",
        },
        {
          name: "Seaside Resort",
          description: "Beautiful beachfront resort with stunning ocean views",
          location: "Beachfront",
          address: "456 Ocean Drive",
          city: "Miami",
          country: "USA",
          rating: 4.8,
          total_reviews: 890,
          amenities: ["Ocean View", "Restaurant", "Gym", "Beach Access", "Pool"],
          couple_friendly: true,
          image_url:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDc5MkVGIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiPlNlYXNpZGUgUmVzb3J0PC90ZXh0Pgo8L3N2Zz4K",
        },
        {
          name: "City Comfort Inn",
          description: "Comfortable and affordable accommodation in midtown",
          location: "Midtown",
          address: "789 City Avenue",
          city: "New York",
          country: "USA",
          rating: 4.0,
          total_reviews: 650,
          amenities: ["Free Breakfast", "Parking", "Pet Friendly", "Free WiFi"],
          couple_friendly: false,
          image_url:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMTBCOTgxIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiPkNpdHkgQ29tZm9ydDwvdGV4dD4KPC9zdmc+Cg==",
        },
      ]

      for (const hotel of hotelData) {
        await sql`
          INSERT INTO hotels (name, description, location, address, city, country, rating, total_reviews, amenities, couple_friendly, image_url)
          VALUES (${hotel.name}, ${hotel.description}, ${hotel.location}, ${hotel.address}, ${hotel.city}, ${hotel.country}, ${hotel.rating}, ${hotel.total_reviews}, ${hotel.amenities}, ${hotel.couple_friendly}, ${hotel.image_url})
        `
      }

      console.log("✅ Sample hotels inserted")

      // Insert sample rooms
      console.log("🛏️ Inserting sample rooms...")

      const roomData = [
        {
          hotel_id: 1,
          room_type: "Standard Room",
          description: "Comfortable room with city view",
          price_per_night: 120.0,
          max_occupancy: 2,
          amenities: ["Free WiFi", "Air Conditioning", "TV"],
          total_rooms: 20,
          available_rooms: 15,
          image_url:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjM2NjZCIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiI+U3RhbmRhcmQgUm9vbTwvdGV4dD4KPC9zdmc+Cg==",
        },
        {
          hotel_id: 1,
          room_type: "Deluxe Suite",
          description: "Spacious suite with premium amenities",
          price_per_night: 250.0,
          max_occupancy: 4,
          amenities: ["Free WiFi", "Air Conditioning", "TV", "Mini Bar", "Balcony"],
          total_rooms: 10,
          available_rooms: 8,
          image_url:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkVGM0M3Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTI0MDBEIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiI+RGVsdXhlIFN1aXRlPC90ZXh0Pgo8L3N2Zz4K",
        },
        {
          hotel_id: 2,
          room_type: "Ocean View Room",
          description: "Room with stunning ocean views",
          price_per_night: 200.0,
          max_occupancy: 2,
          amenities: ["Ocean View", "Free WiFi", "Air Conditioning", "TV"],
          total_rooms: 30,
          available_rooms: 25,
          image_url:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRENGREZGIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDc5MkVGIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiI+T2NlYW4gVmlldyBSb29tPC90ZXh0Pgo8L3N2Zz4K",
        },
        {
          hotel_id: 2,
          room_type: "Beach Villa",
          description: "Private villa steps from the beach",
          price_per_night: 400.0,
          max_occupancy: 6,
          amenities: ["Ocean View", "Private Beach", "Kitchen", "Free WiFi"],
          total_rooms: 5,
          available_rooms: 3,
          image_url:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkVGM0M3Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRUE1ODA2IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiI+QmVhY2ggVmlsbGE8L3RleHQ+Cjwvc3ZnPgo=",
        },
        {
          hotel_id: 3,
          room_type: "Standard Room",
          description: "Clean and comfortable standard room",
          price_per_night: 85.0,
          max_occupancy: 2,
          amenities: ["Free WiFi", "Air Conditioning", "TV"],
          total_rooms: 40,
          available_rooms: 35,
          image_url:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjM2NjZCIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiI+U3RhbmRhcmQgUm9vbTwvdGV4dD4KPC9zdmc+Cg==",
        },
        {
          hotel_id: 3,
          room_type: "Family Room",
          description: "Spacious room perfect for families",
          price_per_night: 120.0,
          max_occupancy: 4,
          amenities: ["Free WiFi", "Air Conditioning", "TV", "Microwave"],
          total_rooms: 15,
          available_rooms: 12,
          image_url:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkVGM0M3Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTI0MDBEIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiI+RmFtaWx5IFJvb208L3RleHQ+Cjwvc3ZnPgo=",
        },
      ]

      for (const room of roomData) {
        await sql`
          INSERT INTO rooms (hotel_id, room_type, description, price_per_night, max_occupancy, amenities, total_rooms, available_rooms, image_url)
          VALUES (${room.hotel_id}, ${room.room_type}, ${room.description}, ${room.price_per_night}, ${room.max_occupancy}, ${room.amenities}, ${room.total_rooms}, ${room.available_rooms}, ${room.image_url})
        `
      }

      console.log("✅ Sample rooms inserted")

      // Insert sample reviews
      console.log("⭐ Inserting sample reviews...")
      await sql`
        INSERT INTO reviews (user_id, hotel_id, rating, title, comment)
        VALUES 
        (1, 1, 5, 'Excellent stay!', 'The Grand Plaza Hotel exceeded all expectations. The service was impeccable and the amenities were top-notch.'),
        (1, 2, 4, 'Beautiful ocean views', 'The Seaside Resort had stunning views and great beach access. Would definitely return!'),
        (1, 3, 4, 'Good value for money', 'City Comfort Inn provided exactly what we needed at a reasonable price. Clean and comfortable.')
      `
      console.log("✅ Sample reviews inserted")
    } else {
      console.log("ℹ️ Sample data already exists, skipping insertion")
    }

    // Verify final state
    const finalCounts = await sql`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM hotels) as hotels,
        (SELECT COUNT(*) FROM rooms) as rooms,
        (SELECT COUNT(*) FROM bookings) as bookings,
        (SELECT COUNT(*) FROM reviews) as reviews
    `

    console.log("📋 Final counts:", finalCounts[0])

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
      counts: finalCounts[0],
    })
  } catch (error) {
    console.error("❌ Error initializing database:", error)

    // Return detailed error information
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize database",
        details: error.message,
        name: error.name,
        code: error.code,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
