const admin = require('firebase-admin');
const pool = require('../db/config');
require('dotenv').config();

async function testConnections() {
    console.log('Testing connections...');

    // Test PostgreSQL connection
    try {
        const dbResult = await pool.query('SELECT NOW()');
        console.log('✅ PostgreSQL connection successful:', dbResult.rows[0].now);
    } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error.message);
    }

    // Test Firebase Admin initialization
    try {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
                })
            });
        }
        console.log('✅ Firebase Admin initialized successfully');
        
        // Test Firebase Auth
        try {
            const listUsersResult = await admin.auth().listUsers(1);
            console.log('✅ Firebase Auth working. Total users:', listUsersResult.users.length);
        } catch (authError) {
            console.error('❌ Firebase Auth test failed:', authError.message);
        }
    } catch (error) {
        console.error('❌ Firebase Admin initialization failed:', error.message);
    }

    // Test database schema
    try {
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('📋 Database tables:', tables.rows.map(row => row.table_name));
    } catch (error) {
        console.error('❌ Failed to query database schema:', error.message);
    }

    // Close connections
    try {
        await pool.end();
        console.log('✅ Database connection closed');
    } catch (error) {
        console.error('❌ Error closing database connection:', error.message);
    }
}

// Run the tests
testConnections().catch(console.error);
