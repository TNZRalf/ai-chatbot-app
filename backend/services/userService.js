const pool = require('../db/config');
const admin = require('firebase-admin');

class UserService {
    async createUser(firebaseUser) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Insert user
            const userResult = await client.query(
                `INSERT INTO users (firebase_uid, email, display_name, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $4)
                ON CONFLICT (firebase_uid) DO UPDATE
                SET email = EXCLUDED.email,
                    display_name = EXCLUDED.display_name,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING id`,
                [firebaseUser.uid, firebaseUser.email, firebaseUser.displayName || null, new Date()]
            );

            const userId = userResult.rows[0].id;

            // Create or update user preferences
            await client.query(
                `INSERT INTO user_preferences (user_id, theme, notifications_enabled, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $4)
                ON CONFLICT (user_id) DO NOTHING`,
                [userId, 'light', true, new Date()]
            );

            // Create or update profile
            await client.query(
                `INSERT INTO profiles (user_id, created_at, updated_at)
                VALUES ($1, $2, $2)
                ON CONFLICT (user_id) DO NOTHING`,
                [userId, new Date()]
            );

            await client.query('COMMIT');
            return userId;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getUserByFirebaseUid(firebaseUid) {
        const result = await pool.query(
            `SELECT u.*, p.bio, p.avatar_url, up.theme, up.notifications_enabled
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            LEFT JOIN user_preferences up ON u.id = up.user_id
            WHERE u.firebase_uid = $1`,
            [firebaseUid]
        );
        return result.rows[0];
    }

    async updateUser(userId, userData) {
        const result = await pool.query(
            `UPDATE users
            SET display_name = COALESCE($2, display_name),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *`,
            [userId, userData.displayName]
        );
        return result.rows[0];
    }

    async deleteUser(firebaseUid) {
        // Note: Due to CASCADE, this will automatically delete related records
        const result = await pool.query(
            'DELETE FROM users WHERE firebase_uid = $1 RETURNING *',
            [firebaseUid]
        );
        return result.rows[0];
    }
}

module.exports = new UserService();
