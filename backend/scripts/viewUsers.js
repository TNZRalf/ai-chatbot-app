const pool = require('../db/config');

async function viewUsers() {
    try {
        console.log('👥 Fetching users from database...\n');

        const result = await pool.query(`
            SELECT 
                id,
                firebase_uid,
                email,
                created_at,
                updated_at
            FROM users
            ORDER BY created_at DESC;
        `);

        console.log('To view this data in PgAdmin4:');
        console.log('1. Open PgAdmin4');
        console.log('2. Navigate to your database (OCC_DB)');
        console.log('3. Right-click on "Tables"');
        console.log('4. Find and right-click on "users" table');
        console.log('5. Select "View/Edit Data" -> "All Rows"\n');

        console.log('Or you can run this SQL query in PgAdmin4 Query Tool:');
        console.log(`
SELECT id, firebase_uid, email, created_at, updated_at
FROM users
ORDER BY created_at DESC;
        `);

        console.log('\nCurrent users in database:');
        console.table(result.rows);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

viewUsers().catch(console.error);
