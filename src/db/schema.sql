-- First, create the database (run this separately)
-- CREATE DATABASE ai_chatbot_db;

-- Then connect to the database and run these commands:

-- Create required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE sender_type AS ENUM ('user', 'ai');
CREATE TYPE provider_type AS ENUM ('local', 'google', 'facebook');

-- Drop tables if they exist (be careful with this in production)
DROP TABLE IF EXISTS "Messages";
DROP TABLE IF EXISTS "Users";

-- Create Users table
CREATE TABLE "Users" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255),  -- Nullable for social login
    "googleId" VARCHAR(255),
    "facebookId" VARCHAR(255),
    "profilePicture" VARCHAR(255),
    provider provider_type NOT NULL DEFAULT 'local',
    "lastActive" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_email UNIQUE (email),
    CONSTRAINT unique_username UNIQUE (username),
    CONSTRAINT unique_google_id UNIQUE ("googleId"),
    CONSTRAINT unique_facebook_id UNIQUE ("facebookId")
);

-- Create Messages table
CREATE TABLE "Messages" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    sender sender_type NOT NULL,
    "attachmentUrl" VARCHAR(255),
    "attachmentType" VARCHAR(255),
    "attachmentName" VARCHAR(255),
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY ("userId") REFERENCES "Users"(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_messages_user_id ON "Messages"("userId");
CREATE INDEX idx_messages_created_at ON "Messages"("createdAt" DESC);
CREATE INDEX idx_users_email ON "Users"(email);
CREATE INDEX idx_users_username ON "Users"(username);
CREATE INDEX idx_users_google_id ON "Users"("googleId");
CREATE INDEX idx_users_facebook_id ON "Users"("facebookId");

-- Create trigger function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON "Users"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON "Messages"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sample insert queries for testing (uncomment to use)
/*
-- Insert a test user with local auth
INSERT INTO "Users" (username, email, password, provider)
VALUES ('testuser', 'test@example.com', 'hashedpassword', 'local');

-- Insert a test user with Google auth
INSERT INTO "Users" (username, email, "googleId", provider, "profilePicture")
VALUES ('googleuser', 'google@example.com', '123456789', 'google', 'https://example.com/photo.jpg');

-- Insert a test message
INSERT INTO "Messages" (content, sender, "userId")
SELECT 'Hello, World!', 'user', id FROM "Users" WHERE email = 'test@example.com';
*/

-- Useful queries for managing data

-- Get all messages for a user with their details
/*
SELECT m.*, u.username, u.email 
FROM "Messages" m
JOIN "Users" u ON m."userId" = u.id
WHERE u.email = 'test@example.com'
ORDER BY m."createdAt" DESC;
*/

-- Get user statistics
/*
SELECT 
    u.username,
    u.email,
    u.provider,
    COUNT(m.id) as message_count,
    MAX(m."createdAt") as last_message_date
FROM "Users" u
LEFT JOIN "Messages" m ON u.id = m."userId"
GROUP BY u.id;
*/

-- Delete all data (be very careful with this!)
/*
TRUNCATE TABLE "Messages" CASCADE;
TRUNCATE TABLE "Users" CASCADE;
*/
