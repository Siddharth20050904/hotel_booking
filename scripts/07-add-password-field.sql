-- Add password field to users table for credential-based authentication
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Update the existing demo user to have a password (for testing)
UPDATE users 
SET password = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBMY9f5zqiUm4W' -- password: "demo123"
WHERE email = 'demo@example.com';
