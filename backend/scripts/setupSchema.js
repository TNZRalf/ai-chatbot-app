const pool = require('../db/config');

async function setupSchema() {
    try {
        console.log('🔧 Setting up database schema...');

        // Drop existing tables and constraints
        await pool.query(`
            DROP TABLE IF EXISTS user_preferences CASCADE;
            DROP TABLE IF EXISTS resumes CASCADE;
            DROP TABLE IF EXISTS profiles CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
        `);
        console.log('✅ Cleaned up existing tables');

        // Create users table
        await pool.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                firebase_uid VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255),
                display_name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Users table created');

        // Create profiles table
        await pool.query(`
            CREATE TABLE profiles (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                bio TEXT,
                avatar_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Profiles table created');

        // Create resumes table
        await pool.query(`
            CREATE TABLE resumes (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255),
                content JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Resumes table created');

        // Create user_preferences table
        await pool.query(`
            CREATE TABLE user_preferences (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                theme VARCHAR(50) DEFAULT 'light',
                notifications_enabled BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ User preferences table created');

        // Create function to update updated_at timestamp
        await pool.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);

        // Create triggers for all tables
        const tables = ['users', 'profiles', 'resumes', 'user_preferences'];
        for (const table of tables) {
            await pool.query(`
                DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
                CREATE TRIGGER update_${table}_updated_at
                    BEFORE UPDATE ON ${table}
                    FOR EACH ROW
                    EXECUTE FUNCTION update_updated_at_column();
            `);
        }
        console.log('✅ Update triggers created for all tables');

        console.log('\n✅ Database schema setup complete!');

    } catch (error) {
        console.error('Error setting up schema:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

setupSchema().catch(console.error);
