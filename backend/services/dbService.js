const pool = require('../db/config');

class DbService {
    // User operations
    async createUser(firebaseUid, email) {
        const result = await pool.query(
            'INSERT INTO users (firebase_uid, email) VALUES ($1, $2) RETURNING *',
            [firebaseUid, email]
        );
        return result.rows[0];
    }

    // Profile operations
    async createProfile(firebaseUid, summary) {
        const result = await pool.query(
            'INSERT INTO profiles (firebase_uid, summary) VALUES ($1, $2) RETURNING profile_id',
            [firebaseUid, summary]
        );
        return result.rows[0];
    }

    async savePersonalInfo(profileId, personalInfo) {
        const { full_name, email, phone, linkedin_url, github_url, location } = personalInfo;
        const result = await pool.query(
            `INSERT INTO personal_info 
            (profile_id, full_name, email, phone, linkedin_url, github_url, location)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [profileId, full_name, email, phone, linkedin_url, github_url, location]
        );
        return result.rows[0];
    }

    async saveEducation(profileId, educationList) {
        const results = [];
        for (const edu of educationList) {
            const result = await pool.query(
                `INSERT INTO education 
                (profile_id, institution, degree, start_date, end_date)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *`,
                [profileId, edu.institution, edu.degree, edu.startDate, edu.endDate]
            );
            results.push(result.rows[0]);
        }
        return results;
    }

    async saveExperience(profileId, experienceList) {
        const results = [];
        for (const exp of experienceList) {
            const result = await pool.query(
                `INSERT INTO experience 
                (profile_id, company, position, start_date, end_date, highlights)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [profileId, exp.company, exp.position, exp.startDate, exp.endDate, exp.highlights]
            );
            results.push(result.rows[0]);
        }
        return results;
    }

    async saveSkills(profileId, skills) {
        const results = [];
        for (const skill of skills) {
            const result = await pool.query(
                'INSERT INTO skills (profile_id, skill_name) VALUES ($1, $2) RETURNING *',
                [profileId, skill]
            );
            results.push(result.rows[0]);
        }
        return results;
    }

    async saveLanguages(profileId, languages) {
        const results = [];
        for (const lang of languages) {
            const result = await pool.query(
                `INSERT INTO languages 
                (profile_id, language_name, proficiency)
                VALUES ($1, $2, $3)
                RETURNING *`,
                [profileId, lang.name, lang.proficiency]
            );
            results.push(result.rows[0]);
        }
        return results;
    }

    // Save complete CV data
    async saveCV(firebaseUid, parsedCV) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Create profile
            const profileResult = await client.query(
                'INSERT INTO profiles (firebase_uid, summary) VALUES ($1, $2) RETURNING profile_id',
                [firebaseUid, parsedCV.personal_info.summary]
            );
            const profileId = profileResult.rows[0].profile_id;

            // Save personal info
            await client.query(
                `INSERT INTO personal_info 
                (profile_id, full_name, email, phone, linkedin_url, github_url, location)
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    profileId,
                    parsedCV.personal_info.name,
                    parsedCV.personal_info.email,
                    parsedCV.personal_info.phone,
                    parsedCV.personal_info.linkedin,
                    parsedCV.personal_info.github,
                    parsedCV.personal_info.location
                ]
            );

            // Save education
            for (const edu of parsedCV.education) {
                await client.query(
                    `INSERT INTO education 
                    (profile_id, institution, degree, start_date, end_date)
                    VALUES ($1, $2, $3, $4, $5)`,
                    [profileId, edu.institution, edu.degree, edu.startDate, edu.endDate]
                );
            }

            // Save experience
            for (const exp of parsedCV.experience) {
                await client.query(
                    `INSERT INTO experience 
                    (profile_id, company, position, start_date, end_date, highlights)
                    VALUES ($1, $2, $3, $4, $5, $6)`,
                    [profileId, exp.company, exp.position, exp.startDate, exp.endDate, exp.highlights]
                );
            }

            // Save skills
            for (const skill of parsedCV.skills) {
                await client.query(
                    'INSERT INTO skills (profile_id, skill_name) VALUES ($1, $2)',
                    [profileId, skill]
                );
            }

            // Save languages
            for (const lang of parsedCV.languages) {
                await client.query(
                    `INSERT INTO languages 
                    (profile_id, language_name, proficiency)
                    VALUES ($1, $2, $3)`,
                    [profileId, lang.name, lang.proficiency]
                );
            }

            await client.query('COMMIT');
            return { success: true, profileId };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Fetch CV data
    async getCV(profileId) {
        const result = {
            personal_info: null,
            education: [],
            experience: [],
            skills: [],
            languages: []
        };

        // Get personal info
        const personalInfoResult = await pool.query(
            'SELECT * FROM personal_info WHERE profile_id = $1',
            [profileId]
        );
        result.personal_info = personalInfoResult.rows[0];

        // Get education
        const educationResult = await pool.query(
            'SELECT * FROM education WHERE profile_id = $1 ORDER BY start_date DESC',
            [profileId]
        );
        result.education = educationResult.rows;

        // Get experience
        const experienceResult = await pool.query(
            'SELECT * FROM experience WHERE profile_id = $1 ORDER BY start_date DESC',
            [profileId]
        );
        result.experience = experienceResult.rows;

        // Get skills
        const skillsResult = await pool.query(
            'SELECT skill_name FROM skills WHERE profile_id = $1',
            [profileId]
        );
        result.skills = skillsResult.rows.map(row => row.skill_name);

        // Get languages
        const languagesResult = await pool.query(
            'SELECT language_name, proficiency FROM languages WHERE profile_id = $1',
            [profileId]
        );
        result.languages = languagesResult.rows;

        return result;
    }
}

module.exports = new DbService();
