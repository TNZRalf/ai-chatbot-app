-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Mirror of Firebase users
CREATE TABLE IF NOT EXISTS users (
    firebase_uid TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Main profile table
CREATE TABLE IF NOT EXISTS profiles (
    profile_id SERIAL PRIMARY KEY,
    firebase_uid TEXT REFERENCES users(firebase_uid),
    summary TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Personal info (1:1 with profiles)
CREATE TABLE IF NOT EXISTS personal_info (
    profile_id INT PRIMARY KEY REFERENCES profiles(profile_id),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    location TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Education (1:many with profiles)
CREATE TABLE IF NOT EXISTS education (
    education_id SERIAL PRIMARY KEY,
    profile_id INT REFERENCES profiles(profile_id),
    institution TEXT NOT NULL,
    degree TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Experience (1:many with profiles)
CREATE TABLE IF NOT EXISTS experience (
    experience_id SERIAL PRIMARY KEY,
    profile_id INT REFERENCES profiles(profile_id),
    company TEXT NOT NULL,
    position TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    highlights TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Skills (1:many with profiles)
CREATE TABLE IF NOT EXISTS skills (
    skill_id SERIAL PRIMARY KEY,
    profile_id INT REFERENCES profiles(profile_id),
    skill_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Languages (1:many with profiles)
CREATE TABLE IF NOT EXISTS languages (
    language_id SERIAL PRIMARY KEY,
    profile_id INT REFERENCES profiles(profile_id),
    language_name TEXT NOT NULL,
    proficiency TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT valid_proficiency CHECK (proficiency IN ('Native', 'Fluent', 'Professional', 'Intermediate', 'Basic'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profile_skills ON skills(skill_name);
CREATE INDEX IF NOT EXISTS idx_profile_location ON personal_info(location);
CREATE INDEX IF NOT EXISTS idx_education_dates ON education(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_experience_dates ON experience(start_date, end_date);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personal_info_updated_at
    BEFORE UPDATE ON personal_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_updated_at
    BEFORE UPDATE ON education
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experience_updated_at
    BEFORE UPDATE ON experience
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_languages_updated_at
    BEFORE UPDATE ON languages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
