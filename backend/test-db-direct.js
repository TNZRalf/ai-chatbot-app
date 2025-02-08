const { Pool } = require('pg');

const config = {
    user: 'OCC_User',
    host: 'localhost',
    database: 'OCC_DB',
    password: 'user123',
    port: 5432
};

console.log('Testing connection with:', { ...config, password: '****' });

const pool = new Pool(config);

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to PostgreSQL!');
        
        // Test query
        const result = await client.query('SELECT current_timestamp;');
        console.log('Database time:', result.rows[0].current_timestamp);
        
        // Test table creation
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Available tables:', tablesResult.rows.map(row => row.table_name));
        
        client.release();
    } catch (err) {
        console.error('Error connecting to the database:', err.message);
        console.error('Full error:', err);
    } finally {
        // Close pool
        await pool.end();
    }
}

testConnection();
