-- Create rooms table
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
);
