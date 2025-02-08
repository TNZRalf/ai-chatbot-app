const pool = require('../db/config');
const admin = require('firebase-admin');
require('dotenv').config();

async function syncUsers() {
    try {
        // Initialize Firebase Admin if not already initialized
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
                })
            });
        }

        console.log('🔄 Starting user synchronization...');

        // Get all Firebase users
        const firebaseUsers = await admin.auth().listUsers();
        console.log(`Found ${firebaseUsers.users.length} users in Firebase`);

        // Get all database users
        const dbUsers = await pool.query('SELECT firebase_uid, email FROM users');
        console.log(`Found ${dbUsers.rows.length} users in database`);

        // Create sets for easy lookup
        const dbUserIds = new Set(dbUsers.rows.map(u => u.firebase_uid));

        // Find users to add to database
        const usersToAdd = firebaseUsers.users.filter(user => !dbUserIds.has(user.uid));
        console.log(`Found ${usersToAdd.length} users to add to database`);

        // Add missing users to database
        if (usersToAdd.length > 0) {
            console.log('\nAdding users to database...');
            for (const user of usersToAdd) {
                try {
                    await pool.query(
                        'INSERT INTO users (firebase_uid, email, created_at) VALUES ($1, $2, $3)',
                        [user.uid, user.email, new Date()]
                    );
                    console.log(`✅ Added user ${user.email} (${user.uid})`);
                } catch (error) {
                    console.error(`❌ Failed to add user ${user.email}:`, error.message);
                }
            }
        }

        console.log('\n✅ User synchronization complete!');
        
        // Final verification
        const finalDbUsers = await pool.query('SELECT COUNT(*) FROM users');
        console.log(`\nFinal count in database: ${finalDbUsers.rows[0].count} users`);

    } catch (error) {
        console.error('Error during synchronization:', error);
    } finally {
        await pool.end();
    }
}

syncUsers().catch(console.error);
