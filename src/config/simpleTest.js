const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'Z123789123Zakaria@',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL!');

    // Create new user if it doesn't exist
    try {
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'app_user') THEN
            CREATE USER app_user WITH PASSWORD 'app123456';
          END IF;
        END
        $$;
      `);
      console.log('✅ User checked/created');

      // Grant privileges
      await client.query(`
        GRANT ALL PRIVILEGES ON DATABASE ai_chatbot_db TO app_user;
      `);
      console.log('✅ Privileges granted on database');

      // Connect to ai_chatbot_db
      const dbClient = new Client({
        user: 'app_user',
        host: 'localhost',
        database: 'ai_chatbot_db',
        password: 'app123456',
        port: 5432,
      });

      await dbClient.connect();
      console.log('✅ Successfully connected as app_user!');
      
      const tables = await dbClient.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      console.log('\n📋 Existing tables:');
      if (tables.rows.length === 0) {
        console.log('No tables found. Database is empty.');
      } else {
        tables.rows.forEach(table => {
          console.log(`- ${table.table_name}`);
        });
      }

      await dbClient.end();
    } catch (err) {
      console.error('Error during setup:', err.message);
    }

  } catch (err) {
    console.error('❌ Error connecting to the database:', err.message);
  } finally {
    await client.end();
  }
}

testConnection();
