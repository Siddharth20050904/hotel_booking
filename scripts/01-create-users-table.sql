-- Create users table for authentication and profiles
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
);
