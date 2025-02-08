const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function setupDatabase() {
  // Connect directly to our application database with OCC_User
  const appPool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
  });

  try {
    // Create tables
    await appPool.query(`
      -- Create users table
      CREATE TABLE IF NOT EXISTS users (
          firebase_uid VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          display_name VARCHAR(200),
          photo_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create user_preferences table
      CREATE TABLE IF NOT EXISTS user_preferences (
          user_id VARCHAR(255) PRIMARY KEY REFERENCES users(firebase_uid) ON DELETE CASCADE,
          theme VARCHAR(20) DEFAULT 'light',
          notifications BOOLEAN DEFAULT true,
          language VARCHAR(10) DEFAULT 'en',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create profiles table for CV data
      CREATE TABLE IF NOT EXISTS profiles (
          profile_id SERIAL PRIMARY KEY,
          firebase_uid VARCHAR(255) REFERENCES users(firebase_uid) ON DELETE CASCADE,
          summary TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create personal_info table
      CREATE TABLE IF NOT EXISTS personal_info (
          info_id SERIAL PRIMARY KEY,
          profile_id INTEGER REFERENCES profiles(profile_id) ON DELETE CASCADE,
          full_name VARCHAR(200),
          email VARCHAR(255),
          phone VARCHAR(50),
          linkedin_url TEXT,
          github_url TEXT,
          location VARCHAR(200),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(profile_id)
      );

      -- Create education table
      CREATE TABLE IF NOT EXISTS education (
          education_id SERIAL PRIMARY KEY,
          profile_id INTEGER REFERENCES profiles(profile_id) ON DELETE CASCADE,
          institution VARCHAR(255),
          degree VARCHAR(255),
          field_of_study VARCHAR(255),
          start_date DATE,
          end_date DATE,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create experience table
      CREATE TABLE IF NOT EXISTS experience (
          experience_id SERIAL PRIMARY KEY,
          profile_id INTEGER REFERENCES profiles(profile_id) ON DELETE CASCADE,
          company VARCHAR(255),
          position VARCHAR(255),
          location VARCHAR(255),
          start_date DATE,
          end_date DATE,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create skills table
      CREATE TABLE IF NOT EXISTS skills (
          skill_id SERIAL PRIMARY KEY,
          profile_id INTEGER REFERENCES profiles(profile_id) ON DELETE CASCADE,
          name VARCHAR(100),
          category VARCHAR(100),
          proficiency_level VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create update_timestamp function
    await appPool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers
    await appPool.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
          BEFORE UPDATE ON users
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
      CREATE TRIGGER update_user_preferences_updated_at
          BEFORE UPDATE ON user_preferences
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
      CREATE TRIGGER update_profiles_updated_at
          BEFORE UPDATE ON profiles
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_personal_info_updated_at ON personal_info;
      CREATE TRIGGER update_personal_info_updated_at
          BEFORE UPDATE ON personal_info
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_education_updated_at ON education;
      CREATE TRIGGER update_education_updated_at
          BEFORE UPDATE ON education
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_experience_updated_at ON experience;
      CREATE TRIGGER update_experience_updated_at
          BEFORE UPDATE ON experience
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_skills_updated_at ON skills;
      CREATE TRIGGER update_skills_updated_at
          BEFORE UPDATE ON skills
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('Database setup completed successfully');
    await appPool.end();
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
