import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST() {
  try {
    // Create users table
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
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create hotels table
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

    // Create rooms table
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

    // Create bookings table
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

    // Create reviews table
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

    // Insert sample user
    await sql`
      INSERT INTO users (email, first_name, last_name, phone, id_type, id_number, preferred_currency, preferred_language) 
      VALUES ('demo@example.com', 'Demo', 'User', '+1-555-0123', 'passport', 'AB123456', 'USD', 'english')
      ON CONFLICT (email) DO NOTHING
    `

    // Insert sample hotels
    await sql`
      INSERT INTO hotels (name, description, location, address, city, country, rating, total_reviews, amenities, couple_friendly, image_url) 
      VALUES 
      ('Grand Plaza Hotel', 'Luxury hotel in the heart of downtown with world-class amenities', 'Downtown', '123 Main Street', 'New York', 'USA', 4.5, 1250, ARRAY['Free WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant'], true, '/placeholder.svg?height=200&width=300'),
      ('Seaside Resort', 'Beautiful beachfront resort with stunning ocean views', 'Beachfront', '456 Ocean Drive', 'Miami', 'USA', 4.8, 890, ARRAY['Ocean View', 'Restaurant', 'Gym', 'Beach Access', 'Pool'], true, '/placeholder.svg?height=200&width=300'),
      ('City Comfort Inn', 'Comfortable and affordable accommodation in midtown', 'Midtown', '789 City Avenue', 'New York', 'USA', 4.0, 650, ARRAY['Free Breakfast', 'Parking', 'Pet Friendly', 'Free WiFi'], false, '/placeholder.svg?height=200&width=300'),
      ('Mountain View Lodge', 'Scenic mountain retreat perfect for nature lovers', 'Highlands', '321 Mountain Road', 'Denver', 'USA', 4.6, 420, ARRAY['Scenic Views', 'Fireplace', 'Hiking Trails', 'Restaurant'], true, '/placeholder.svg?height=200&width=300'),
      ('Urban Boutique Hotel', 'Stylishly designed boutique hotel in the trendy arts district', 'Arts District', '654 Art Street', 'Los Angeles', 'USA', 4.7, 780, ARRAY['Rooftop Bar', 'Art Gallery', 'Concierge', 'Free WiFi'], true, '/placeholder.svg?height=200&width=300'),
      ('Budget Stay Inn', 'Clean and comfortable budget accommodation', 'Suburb', '987 Budget Lane', 'Phoenix', 'USA', 3.8, 320, ARRAY['Budget Friendly', '24/7 Reception', 'Free Parking', 'Free WiFi'], false, '/placeholder.svg?height=200&width=300')
      ON CONFLICT DO NOTHING
    `

    // Insert sample rooms for each hotel
    await sql`
      INSERT INTO rooms (hotel_id, room_type, description, price_per_night, max_occupancy, amenities, total_rooms, available_rooms) 
      VALUES 
      (1, 'Standard Room', 'Comfortable room with city view', 120.00, 2, ARRAY['Free WiFi', 'Air Conditioning', 'TV'], 20, 15),
      (1, 'Deluxe Suite', 'Spacious suite with premium amenities', 250.00, 4, ARRAY['Free WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Balcony'], 10, 8),
      (2, 'Ocean View Room', 'Room with stunning ocean views', 200.00, 2, ARRAY['Ocean View', 'Free WiFi', 'Air Conditioning', 'TV'], 30, 25),
      (2, 'Beach Villa', 'Private villa steps from the beach', 400.00, 6, ARRAY['Ocean View', 'Private Beach', 'Kitchen', 'Free WiFi'], 5, 3),
      (3, 'Standard Room', 'Clean and comfortable standard room', 85.00, 2, ARRAY['Free WiFi', 'Air Conditioning', 'TV'], 40, 35),
      (3, 'Family Room', 'Spacious room perfect for families', 120.00, 4, ARRAY['Free WiFi', 'Air Conditioning', 'TV', 'Microwave'], 15, 12),
      (4, 'Mountain View Room', 'Room with breathtaking mountain views', 150.00, 2, ARRAY['Mountain View', 'Fireplace', 'Free WiFi'], 25, 20),
      (4, 'Luxury Cabin', 'Private cabin with full amenities', 300.00, 6, ARRAY['Mountain View', 'Fireplace', 'Kitchen', 'Hot Tub'], 8, 6),
      (5, 'Designer Room', 'Stylishly designed room with modern amenities', 175.00, 2, ARRAY['Free WiFi', 'Air Conditioning', 'TV', 'Mini Bar'], 20, 18),
      (5, 'Penthouse Suite', 'Luxury penthouse with rooftop access', 500.00, 4, ARRAY['Rooftop Access', 'Free WiFi', 'Kitchen', 'Balcony'], 3, 2),
      (6, 'Economy Room', 'Basic but clean accommodation', 65.00, 2, ARRAY['Free WiFi', 'Air Conditioning', 'TV'], 50, 45),
      (6, 'Standard Room', 'Comfortable room with standard amenities', 85.00, 3, ARRAY['Free WiFi', 'Air Conditioning', 'TV', 'Microwave'], 20, 18)
      ON CONFLICT DO NOTHING
    `

    // Insert sample reviews
    await sql`
      INSERT INTO reviews (user_id, hotel_id, rating, title, comment)
      VALUES 
      (1, 1, 5, 'Excellent stay!', 'The Grand Plaza Hotel exceeded all expectations. The service was impeccable and the amenities were top-notch.'),
      (1, 2, 4, 'Beautiful ocean views', 'The Seaside Resort had stunning views and great beach access. Would definitely return!'),
      (1, 3, 4, 'Good value for money', 'City Comfort Inn provided exactly what we needed at a reasonable price. Clean and comfortable.')
      ON CONFLICT DO NOTHING
    `

    return NextResponse.json({ message: "Database initialized successfully with sample user" })
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json({ error: "Failed to initialize database", details: error.message }, { status: 500 })
  }
}
