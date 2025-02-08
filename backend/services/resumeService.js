const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
});

class ResumeService {
    async saveResumeData(userId, fileInfo, parsedData) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Insert resume data
            const resumeResult = await client.query(
                `INSERT INTO resume_data (
                    user_id, file_name, file_path, original_name, 
                    mime_type, file_size, parse_status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
                RETURNING id`,
                [
                    userId,
                    fileInfo.filename,
                    fileInfo.path,
                    fileInfo.originalname,
                    fileInfo.mimetype,
                    fileInfo.size,
                    'completed'
                ]
            );

            const resumeId = resumeResult.rows[0].id;

            // Insert personal info
            if (parsedData.personalInfo) {
                await client.query(
                    `INSERT INTO personal_info (
                        resume_id, full_name, email, phone, location,
                        linkedin_url, github_url, portfolio_url, summary
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [
                        resumeId,
                        parsedData.personalInfo.name,
                        parsedData.personalInfo.email,
                        parsedData.personalInfo.phone,
                        parsedData.personalInfo.location,
                        parsedData.personalInfo.linkedin,
                        parsedData.personalInfo.github,
                        parsedData.personalInfo.portfolio,
                        parsedData.summary
                    ]
                );
            }

            // Insert work experience
            if (parsedData.workExperience && parsedData.workExperience.length > 0) {
                const workExperienceValues = parsedData.workExperience.map(exp => {
                    return client.query(
                        `INSERT INTO work_experience (
                            resume_id, company_name, position, location,
                            start_date, end_date, is_current, description
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                        [
                            resumeId,
                            exp.company,
                            exp.position,
                            exp.location,
                            exp.startDate,
                            exp.endDate || null,
                            exp.endDate ? false : true,
                            exp.description
                        ]
                    );
                });
                await Promise.all(workExperienceValues);
            }

            // Insert education
            if (parsedData.education && parsedData.education.length > 0) {
                const educationValues = parsedData.education.map(edu => {
                    return client.query(
                        `INSERT INTO education (
                            resume_id, institution, degree, field_of_study,
                            start_date, end_date, gpa
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                        [
                            resumeId,
                            edu.institution,
                            edu.degree,
                            edu.fieldOfStudy,
                            edu.startDate,
                            edu.endDate,
                            edu.gpa
                        ]
                    );
                });
                await Promise.all(educationValues);
            }

            // Insert skills
            if (parsedData.skills && parsedData.skills.length > 0) {
                const skillValues = parsedData.skills.map(skill => {
                    return client.query(
                        `INSERT INTO skills (
                            resume_id, name, category, proficiency_level
                        ) VALUES ($1, $2, $3, $4)`,
                        [
                            resumeId,
                            skill.name,
                            skill.category,
                            skill.proficiency
                        ]
                    );
                });
                await Promise.all(skillValues);
            }

            // Insert certifications
            if (parsedData.certifications && parsedData.certifications.length > 0) {
                const certificationValues = parsedData.certifications.map(cert => {
                    return client.query(
                        `INSERT INTO certifications (
                            resume_id, name, issuing_organization,
                            issue_date, expiry_date, credential_id, credential_url
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                        [
                            resumeId,
                            cert.name,
                            cert.issuingOrganization,
                            cert.issueDate,
                            cert.expiryDate,
                            cert.credentialId,
                            cert.credentialUrl
                        ]
                    );
                });
                await Promise.all(certificationValues);
            }

            await client.query('COMMIT');
            return resumeId;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error saving resume data:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async getResumeById(resumeId) {
        const client = await pool.connect();
        try {
            // Get basic resume data
            const resumeResult = await client.query(
                'SELECT * FROM resume_data WHERE id = $1',
                [resumeId]
            );

            if (resumeResult.rows.length === 0) {
                throw new Error('Resume not found');
            }

            const resume = resumeResult.rows[0];

            // Get personal info
            const personalInfoResult = await client.query(
                'SELECT * FROM personal_info WHERE resume_id = $1',
                [resumeId]
            );
            resume.personalInfo = personalInfoResult.rows[0] || null;

            // Get work experience
            const workExperienceResult = await client.query(
                'SELECT * FROM work_experience WHERE resume_id = $1 ORDER BY start_date DESC',
                [resumeId]
            );
            resume.workExperience = workExperienceResult.rows;

            // Get education
            const educationResult = await client.query(
                'SELECT * FROM education WHERE resume_id = $1 ORDER BY start_date DESC',
                [resumeId]
            );
            resume.education = educationResult.rows;

            // Get skills
            const skillsResult = await client.query(
                'SELECT * FROM skills WHERE resume_id = $1',
                [resumeId]
            );
            resume.skills = skillsResult.rows;

            // Get certifications
            const certificationsResult = await client.query(
                'SELECT * FROM certifications WHERE resume_id = $1',
                [resumeId]
            );
            resume.certifications = certificationsResult.rows;

            return resume;
        } catch (error) {
            console.error('Error getting resume:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async getUserResumes(userId) {
        const client = await pool.connect();
        try {
            const result = await client.query(
                `SELECT r.*, p.full_name, p.email 
                FROM resume_data r 
                LEFT JOIN personal_info p ON r.id = p.resume_id 
                WHERE r.user_id = $1 
                ORDER BY r.upload_date DESC`,
                [userId]
            );
            return result.rows;
        } catch (error) {
            console.error('Error getting user resumes:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async deleteResume(resumeId, userId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Verify ownership
            const resumeResult = await client.query(
                'SELECT * FROM resume_data WHERE id = $1 AND user_id = $2',
                [resumeId, userId]
            );

            if (resumeResult.rows.length === 0) {
                throw new Error('Resume not found or unauthorized');
            }

            // Delete resume (cascading will handle related records)
            await client.query(
                'DELETE FROM resume_data WHERE id = $1',
                [resumeId]
            );

            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error deleting resume:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new ResumeService();
