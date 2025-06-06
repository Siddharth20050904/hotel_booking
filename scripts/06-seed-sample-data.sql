-- Insert sample hotels
INSERT INTO hotels (name, description, location, address, city, country, rating, total_reviews, amenities, couple_friendly, image_url) VALUES
('Grand Plaza Hotel', 'Luxury hotel in the heart of downtown with world-class amenities', 'Downtown', '123 Main Street', 'New York', 'USA', 4.5, 1250, ARRAY['Free WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant'], true, '/placeholder.svg?height=200&width=300'),
('Seaside Resort', 'Beautiful beachfront resort with stunning ocean views', 'Beachfront', '456 Ocean Drive', 'Miami', 'USA', 4.8, 890, ARRAY['Ocean View', 'Restaurant', 'Gym', 'Beach Access', 'Pool'], true, '/placeholder.svg?height=200&width=300'),
('City Comfort Inn', 'Comfortable and affordable accommodation in midtown', 'Midtown', '789 City Avenue', 'New York', 'USA', 4.0, 650, ARRAY['Free Breakfast', 'Parking', 'Pet Friendly', 'Free WiFi'], false, '/placeholder.svg?height=200&width=300'),
('Mountain View Lodge', 'Scenic mountain retreat perfect for nature lovers', 'Highlands', '321 Mountain Road', 'Denver', 'USA', 4.6, 420, ARRAY['Scenic Views', 'Fireplace', 'Hiking Trails', 'Restaurant'], true, '/placeholder.svg?height=200&width=300'),
('Urban Boutique Hotel', 'Stylish boutique hotel in the trendy arts district', 'Arts District', '654 Art Street', 'Los Angeles', 'USA', 4.7, 780, ARRAY['Rooftop Bar', 'Art Gallery', 'Concierge', 'Free WiFi'], true, '/placeholder.svg?height=200&width=300'),
('Budget Stay Inn', 'Clean and comfortable budget accommodation', 'Suburb', '987 Budget Lane', 'Phoenix', 'USA', 3.8, 320, ARRAY['Budget Friendly', '24/7 Reception', 'Free Parking', 'Free WiFi'], false, '/placeholder.svg?height=200&width=300');

-- Insert sample rooms for each hotel
INSERT INTO rooms (hotel_id, room_type, description, price_per_night, max_occupancy, amenities, total_rooms, available_rooms) VALUES
-- Grand Plaza Hotel rooms
(1, 'Standard Room', 'Comfortable room with city view', 120.00, 2, ARRAY['Free WiFi', 'Air Conditioning', 'TV'], 20, 15),
(1, 'Deluxe Suite', 'Spacious suite with premium amenities', 250.00, 4, ARRAY['Free WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Balcony'], 10, 8),

-- Seaside Resort rooms
(2, 'Ocean View Room', 'Room with stunning ocean views', 200.00, 2, ARRAY['Ocean View', 'Free WiFi', 'Air Conditioning', 'TV'], 30, 25),
(2, 'Beach Villa', 'Private villa steps from the beach', 400.00, 6, ARRAY['Ocean View', 'Private Beach', 'Kitchen', 'Free WiFi'], 5, 3),

-- City Comfort Inn rooms
(3, 'Standard Room', 'Clean and comfortable standard room', 85.00, 2, ARRAY['Free WiFi', 'Air Conditioning', 'TV'], 40, 35),
(3, 'Family Room', 'Spacious room perfect for families', 120.00, 4, ARRAY['Free WiFi', 'Air Conditioning', 'TV', 'Microwave'], 15, 12),

-- Mountain View Lodge rooms
(4, 'Mountain View Room', 'Room with breathtaking mountain views', 150.00, 2, ARRAY['Mountain View', 'Fireplace', 'Free WiFi'], 25, 20),
(4, 'Luxury Cabin', 'Private cabin with full amenities', 300.00, 6, ARRAY['Mountain View', 'Fireplace', 'Kitchen', 'Hot Tub'], 8, 6),

-- Urban Boutique Hotel rooms
(5, 'Designer Room', 'Stylishly designed room with modern amenities', 175.00, 2, ARRAY['Free WiFi', 'Air Conditioning', 'TV', 'Mini Bar'], 20, 18),
(5, 'Penthouse Suite', 'Luxury penthouse with rooftop access', 500.00, 4, ARRAY['Rooftop Access', 'Free WiFi', 'Kitchen', 'Balcony'], 3, 2),

-- Budget Stay Inn rooms
(6, 'Economy Room', 'Basic but clean accommodation', 65.00, 2, ARRAY['Free WiFi', 'Air Conditioning', 'TV'], 50, 45),
(6, 'Standard Room', 'Comfortable room with standard amenities', 85.00, 3, ARRAY['Free WiFi', 'Air Conditioning', 'TV', 'Microwave'], 20, 18);
