const pool = require('../db/config');
const admin = require('firebase-admin');
require('dotenv').config();

async function queryUsers() {
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

        console.log('\n📊 Querying users from PostgreSQL database...');
        const dbUsers = await pool.query('SELECT * FROM users');
        
        console.log('\nDatabase Users:');
        console.table(dbUsers.rows);

        console.log('\n🔥 Fetching users from Firebase...');
        const firebaseUsers = await admin.auth().listUsers();
        
        console.log('\nFirebase Users:');
        const formattedFirebaseUsers = firebaseUsers.users.map(user => ({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            lastSignIn: user.metadata.lastSignInTime
        }));
        console.table(formattedFirebaseUsers);

        // Cross-reference users
        console.log('\n🔄 Cross-referencing users...');
        const firebaseUids = new Set(formattedFirebaseUsers.map(u => u.uid));
        const dbUids = new Set(dbUsers.rows.map(u => u.firebase_uid));

        console.log('\nUIDs in Firebase but not in database:', 
            [...firebaseUids].filter(uid => !dbUids.has(uid)));
        
        console.log('\nUIDs in database but not in Firebase:', 
            [...dbUids].filter(uid => !firebaseUids.has(uid)));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

queryUsers().catch(console.error);
