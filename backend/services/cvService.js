const { Pool } = require('pg');
const path = require('path');
const resumeService = require('./resumeService');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});

const createOrUpdateProfile = async (firebaseUid, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert or update profile
    const profileResult = await client.query(
      `INSERT INTO profiles (firebase_uid, summary)
       VALUES ($1, $2)
       ON CONFLICT (firebase_uid)
       DO UPDATE SET summary = $2, updated_at = CURRENT_TIMESTAMP
       RETURNING profile_id`,
      [firebaseUid, data.summary || '']
    );

    const profileId = profileResult.rows[0].profile_id;

    // Insert or update personal info
    await client.query(
      `INSERT INTO personal_info (profile_id, full_name, email, phone, linkedin_url, github_url, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (profile_id)
       DO UPDATE SET 
         full_name = $2,
         email = $3,
         phone = $4,
         linkedin_url = $5,
         github_url = $6,
         location = $7,
         updated_at = CURRENT_TIMESTAMP`,
      [
        profileId,
        data.personalInfo?.name || '',
        data.personalInfo?.email || '',
        data.personalInfo?.phone || '',
        data.personalInfo?.linkedin || '',
        data.personalInfo?.github || '',
        data.personalInfo?.location || ''
      ]
    );

    // Delete existing education entries and insert new ones
    await client.query('DELETE FROM education WHERE profile_id = $1', [profileId]);
    if (data.education && data.education.length > 0) {
      const educationValues = data.education.map(edu => 
        `(${profileId}, '${edu.institution}', '${edu.degree}', '${edu.startDate}', '${edu.endDate}')`
      ).join(',');
      await client.query(
        `INSERT INTO education (profile_id, institution, degree, start_date, end_date)
         VALUES ${educationValues}`
      );
    }

    // Delete existing experience entries and insert new ones
    await client.query('DELETE FROM experience WHERE profile_id = $1', [profileId]);
    if (data.experience && data.experience.length > 0) {
      const experienceValues = data.experience.map(exp => 
        `(${profileId}, '${exp.company}', '${exp.position}', '${exp.startDate}', '${exp.endDate}', '${exp.description || ''}')`
      ).join(',');
      await client.query(
        `INSERT INTO experience (profile_id, company, position, start_date, end_date, description)
         VALUES ${experienceValues}`
      );
    }

    // Delete existing skills and insert new ones
    await client.query('DELETE FROM skills WHERE profile_id = $1', [profileId]);
    if (data.skills && data.skills.length > 0) {
      const skillValues = data.skills.map(skill => 
        `(${profileId}, '${skill.name}', '${skill.category || 'General'}', '${skill.proficiency || 'Intermediate'}')`
      ).join(',');
      await client.query(
        `INSERT INTO skills (profile_id, name, category, proficiency_level)
         VALUES ${skillValues}`
      );
    }

    await client.query('COMMIT');
    return { success: true, profileId };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in createOrUpdateProfile:', error);
    throw error;
  } finally {
    client.release();
  }
};

const getProfileByFirebaseUid = async (firebaseUid) => {
  const client = await pool.connect();
  try {
    // Get profile and personal info
    const profileResult = await client.query(
      `SELECT p.*, pi.*
       FROM profiles p
       LEFT JOIN personal_info pi ON p.profile_id = pi.profile_id
       WHERE p.firebase_uid = $1`,
      [firebaseUid]
    );

    if (profileResult.rows.length === 0) {
      return null;
    }

    const profile = profileResult.rows[0];

    // Get education
    const educationResult = await client.query(
      'SELECT * FROM education WHERE profile_id = $1 ORDER BY start_date DESC',
      [profile.profile_id]
    );

    // Get experience
    const experienceResult = await client.query(
      'SELECT * FROM experience WHERE profile_id = $1 ORDER BY start_date DESC',
      [profile.profile_id]
    );

    // Get skills
    const skillsResult = await client.query(
      'SELECT * FROM skills WHERE profile_id = $1',
      [profile.profile_id]
    );

    return {
      personalInfo: {
        name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        linkedin: profile.linkedin_url,
        github: profile.github_url,
        location: profile.location,
        summary: profile.summary
      },
      education: educationResult.rows,
      experience: experienceResult.rows,
      skills: skillsResult.rows
    };
  } catch (error) {
    console.error('Error in getProfileByFirebaseUid:', error);
    throw error;
  } finally {
    client.release();
  }
};

const parseCV = async (filePath, userId, fileInfo) => {
  try {
    console.log(`Starting CV parsing for file: ${filePath}`);
    
    // TODO: Integrate with actual CV parsing service
    // For now, using mock data
    const parsedData = {
      personalInfo: {
        name: "Example Name",
        email: "example@email.com",
        phone: "+1234567890",
        location: "City, Country",
        linkedin: "https://linkedin.com/in/example",
        github: "https://github.com/example",
        portfolio: "https://example.com"
      },
      summary: "Experienced professional with expertise in...",
      workExperience: [
        {
          company: "Example Company",
          position: "Senior Developer",
          location: "City, Country",
          startDate: "2020-01-01",
          endDate: null,
          description: "Led development of key features..."
        }
      ],
      education: [
        {
          institution: "Example University",
          degree: "Bachelor's in Computer Science",
          fieldOfStudy: "Computer Science",
          startDate: "2016-09-01",
          endDate: "2020-05-01",
          gpa: "3.8"
        }
      ],
      skills: [
        { name: "JavaScript", category: "Programming", proficiency: "Expert" },
        { name: "React", category: "Frontend", proficiency: "Advanced" },
        { name: "Node.js", category: "Backend", proficiency: "Advanced" }
      ],
      certifications: [
        {
          name: "AWS Certified Developer",
          issuingOrganization: "Amazon Web Services",
          issueDate: "2023-01-01",
          expiryDate: "2026-01-01",
          credentialId: "ABC123",
          credentialUrl: "https://aws.amazon.com/verification"
        }
      ]
    };

    // Save parsed data to database
    const resumeId = await resumeService.saveResumeData(userId, fileInfo, parsedData);

    return {
      resumeId,
      ...parsedData
    };
  } catch (error) {
    console.error('Error parsing CV:', error);
    throw error;
  }
};

const getParseStatus = async (resumeId) => {
  try {
    const resume = await resumeService.getResumeById(resumeId);
    return {
      id: resumeId,
      status: resume.parse_status,
      data: resume
    };
  } catch (error) {
    console.error('Error getting parse status:', error);
    throw error;
  }
};

const getUserResumes = async (userId) => {
  try {
    return await resumeService.getUserResumes(userId);
  } catch (error) {
    console.error('Error getting user resumes:', error);
    throw error;
  }
};

const deleteResume = async (resumeId, userId) => {
  try {
    return await resumeService.deleteResume(resumeId, userId);
  } catch (error) {
    console.error('Error deleting resume:', error);
    throw error;
  }
};

module.exports = {
  createOrUpdateProfile,
  getProfileByFirebaseUid,
  parseCV,
  getParseStatus,
  getUserResumes,
  deleteResume
};
