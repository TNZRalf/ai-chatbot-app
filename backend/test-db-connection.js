const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
    const pool = new Pool({
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASSWORD,
        port: process.env.POSTGRES_PORT,
    });

    try {
        // Test the connection
        const client = await pool.connect();
        console.log('Successfully connected to PostgreSQL!');

        // Get PostgreSQL version
        const versionRes = await client.query('SELECT version()');
        console.log('PostgreSQL version:', versionRes.rows[0].version);

        // List all tables in our database
        const tablesRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        
        console.log('\nDatabase tables:');
        tablesRes.rows.forEach(row => {
            console.log(`- ${row.table_name}`);
        });

        client.release();
        await pool.end();
    } catch (err) {
        console.error('Error connecting to PostgreSQL:', err);
        console.log('\nConnection details used:');
        console.log('User:', process.env.POSTGRES_USER);
        console.log('Host:', process.env.POSTGRES_HOST);
        console.log('Database:', process.env.POSTGRES_DB);
        console.log('Port:', process.env.POSTGRES_PORT);
        process.exit(1);
    }
}

testConnection();
