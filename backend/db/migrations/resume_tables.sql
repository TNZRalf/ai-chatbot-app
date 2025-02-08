-- Create resume_data table
CREATE TABLE IF NOT EXISTS resume_data (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    parse_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create personal_info table
CREATE TABLE IF NOT EXISTS personal_info (
    id SERIAL PRIMARY KEY,
    resume_id INTEGER NOT NULL REFERENCES resume_data(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    location VARCHAR(255),
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create work_experience table
CREATE TABLE IF NOT EXISTS work_experience (
    id SERIAL PRIMARY KEY,
    resume_id INTEGER NOT NULL REFERENCES resume_data(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    description TEXT,
    responsibilities TEXT[],
    achievements TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create education table
CREATE TABLE IF NOT EXISTS education (
    id SERIAL PRIMARY KEY,
    resume_id INTEGER NOT NULL REFERENCES resume_data(id) ON DELETE CASCADE,
    institution VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    field_of_study VARCHAR(255),
    location VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE,
    gpa DECIMAL(3,2),
    achievements TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    resume_id INTEGER NOT NULL REFERENCES resume_data(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    proficiency_level VARCHAR(50),
    years_of_experience INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create certifications table
CREATE TABLE IF NOT EXISTS certifications (
    id SERIAL PRIMARY KEY,
    resume_id INTEGER NOT NULL REFERENCES resume_data(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255) NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    credential_id VARCHAR(255),
    credential_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create languages table
CREATE TABLE IF NOT EXISTS languages (
    id SERIAL PRIMARY KEY,
    resume_id INTEGER NOT NULL REFERENCES resume_data(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    proficiency_level VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    resume_id INTEGER NOT NULL REFERENCES resume_data(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    url VARCHAR(255),
    technologies TEXT[],
    highlights TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_resume_data_user_id ON resume_data(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_info_resume_id ON personal_info(resume_id);
CREATE INDEX IF NOT EXISTS idx_work_experience_resume_id ON work_experience(resume_id);
CREATE INDEX IF NOT EXISTS idx_education_resume_id ON education(resume_id);
CREATE INDEX IF NOT EXISTS idx_skills_resume_id ON skills(resume_id);
CREATE INDEX IF NOT EXISTS idx_certifications_resume_id ON certifications(resume_id);
CREATE INDEX IF NOT EXISTS idx_languages_resume_id ON languages(resume_id);
CREATE INDEX IF NOT EXISTS idx_projects_resume_id ON projects(resume_id);
