const admin = require('firebase-admin');
const pool = require('../db/config');

class FirebaseService {
    constructor() {
        console.log('Firebase service initialized');
    }

    async initUserSyncListener() {
        try {
            console.log('Initializing Firebase user sync listener...');
            
            // Instead of using events, we'll use a periodic sync
            this.startPeriodicSync();
            
            console.log('Firebase user sync initialized successfully');
        } catch (error) {
            console.error('Error initializing Firebase user sync:', error);
        }
    }

    async startPeriodicSync() {
        // Run initial sync
        await this.syncAllUsers();

        // Set up periodic sync every 5 minutes
        setInterval(async () => {
            await this.syncAllUsers();
        }, 5 * 60 * 1000);
    }

    async syncAllUsers() {
        try {
            console.log('Starting user sync...');

            // Get all Firebase users
            const listUsersResult = await admin.auth().listUsers();
            const firebaseUsers = listUsersResult.users;

            // Get all database users
            const dbResult = await pool.query('SELECT firebase_uid FROM users');
            const dbUserIds = new Set(dbResult.rows.map(row => row.firebase_uid));

            // Find users to add
            const usersToAdd = firebaseUsers.filter(user => !dbUserIds.has(user.uid));

            // Sync new users
            for (const user of usersToAdd) {
                await this.syncUserToDatabase(user);
            }

            console.log(`Synced ${usersToAdd.length} new users`);
        } catch (error) {
            console.error('Error in periodic sync:', error);
        }
    }

    async syncUserToDatabase(user) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Check if user already exists
            const existingUser = await client.query(
                'SELECT id FROM users WHERE firebase_uid = $1',
                [user.uid]
            );

            if (existingUser.rows.length === 0) {
                // Insert new user
                const result = await client.query(
                    `INSERT INTO users (
                        firebase_uid,
                        email,
                        display_name,
                        created_at,
                        updated_at
                    ) VALUES ($1, $2, $3, $4, $4)
                    RETURNING id`,
                    [
                        user.uid,
                        user.email,
                        user.displayName || null,
                        new Date()
                    ]
                );

                const userId = result.rows[0].id;

                // Create default user preferences
                await client.query(
                    `INSERT INTO user_preferences (
                        user_id,
                        theme,
                        notifications_enabled,
                        created_at,
                        updated_at
                    ) VALUES ($1, $2, $3, $4, $4)`,
                    [userId, 'light', true, new Date()]
                );

                // Create empty profile
                await client.query(
                    `INSERT INTO profiles (
                        user_id,
                        created_at,
                        updated_at
                    ) VALUES ($1, $2, $2)`,
                    [userId, new Date()]
                );

                await client.query('COMMIT');
                console.log('User successfully synced to database:', user.email);
            }
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error syncing user to database:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async removeUserFromDatabase(firebaseUid) {
        try {
            await pool.query(
                'DELETE FROM users WHERE firebase_uid = $1',
                [firebaseUid]
            );
            console.log('User removed from database:', firebaseUid);
        } catch (error) {
            console.error('Error removing user from database:', error);
            throw error;
        }
    }

    // Method to manually sync a user
    async manualUserSync(user) {
        await this.syncUserToDatabase(user);
    }
}

module.exports = new FirebaseService();
