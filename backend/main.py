from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import json
import traceback
import logging
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from typing import List, Optional
from datetime import datetime
import google.generativeai as genai
import pdfplumber
from docx import Document
import io
import re
import asyncio
import httpx
import tempfile
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3002"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Initialize Gemini
GEMINI_API_KEY = "AIzaSyDlQ3xWeUXEXLBJPpnpCxnckGD_yzXg8s4"
genai.configure(api_key=GEMINI_API_KEY)

# Use faster model and optimize configuration
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config={
        "temperature": 0.2,
        "top_p": 0.7,
        "max_output_tokens": 1024
    }
)

# Database connection parameters
DB_CONFIG = {
    'dbname': os.getenv('POSTGRES_DB'),
    'user': os.getenv('POSTGRES_USER'),
    'password': os.getenv('POSTGRES_PASSWORD'),
    'host': os.getenv('POSTGRES_HOST'),
    'port': os.getenv('POSTGRES_PORT')
}

def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        raise HTTPException(status_code=500, detail="Database connection failed")

# Create tables if they don't exist
def init_db():
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Drop existing CV-related tables if they exist
            cur.execute("""
                DROP TABLE IF EXISTS cv_profiles CASCADE;
                DROP TABLE IF EXISTS education CASCADE;
                DROP TABLE IF EXISTS experience CASCADE;
                DROP TABLE IF EXISTS languages CASCADE;
            """)
            
            # Create users table if it doesn't exist
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    display_name VARCHAR(255),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            """)

            # Create parsed_cv_profiles table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS parsed_cv_profiles (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    name VARCHAR(255),
                    email VARCHAR(255),
                    phone VARCHAR(50),
                    linkedin VARCHAR(255),
                    github VARCHAR(255),
                    location VARCHAR(255),
                    summary TEXT,
                    education JSONB,  -- Store education as JSON array
                    experience JSONB,  -- Store experience as JSON array
                    skills TEXT[],    -- Store skills as array
                    languages JSONB,   -- Store languages as JSON array
                    certifications TEXT[],  -- Store certifications as array
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT unique_user_profile UNIQUE (user_id)
                );

                -- Create trigger to update updated_at timestamp
                CREATE OR REPLACE FUNCTION update_updated_at_column()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ language 'plpgsql';

                DROP TRIGGER IF EXISTS update_parsed_cv_profiles_updated_at ON parsed_cv_profiles;
                
                CREATE TRIGGER update_parsed_cv_profiles_updated_at
                    BEFORE UPDATE ON parsed_cv_profiles
                    FOR EACH ROW
                    EXECUTE FUNCTION update_updated_at_column();
            """)

            conn.commit()
            logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {str(e)}")
        logger.error(traceback.format_exc())
        conn.rollback()
        raise
    finally:
        conn.close()

# Initialize database tables
init_db()

# Updated Pydantic Models with Languages
class Language(BaseModel):
    name: str = ""
    proficiency: str = ""

    @classmethod
    def from_dict(cls, data: dict):
        return cls(**data)

class PersonalInfo(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    linkedin: str = ""
    github: str = ""
    location: str = ""
    summary: str = ""

    @classmethod
    def from_dict(cls, data: dict):
        return cls(**data)

class Education(BaseModel):
    institution: str = ""
    degree: str = ""
    startDate: str = ""
    endDate: str = ""

    @classmethod
    def from_dict(cls, data: dict):
        return cls(**data)

class Experience(BaseModel):
    position: str = ""
    company: str = ""
    startDate: str = ""
    endDate: str = ""
    highlights: List[str] = []

    @classmethod
    def from_dict(cls, data: dict):
        return cls(**data)

class ParsedResume(BaseModel):
    personal_info: PersonalInfo = PersonalInfo()
    education: List[Education] = []
    experience: List[Experience] = []
    skills: List[str] = []
    languages: List[Language] = []
    certifications: List[str] = []

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            personal_info=PersonalInfo.from_dict(data.get('personal_info', {})),
            education=[Education.from_dict(edu) for edu in data.get('education', [])],
            experience=[Experience.from_dict(exp) for exp in data.get('experience', [])],
            skills=data.get('skills', []),
            languages=[Language.from_dict(lang) for lang in data.get('languages', [])],
            certifications=data.get('certifications', [])
        )

class CVProfile(BaseModel):
    firebase_uid: str
    summary: str = ""
    personalInfo: PersonalInfo
    education: List[Education] = []
    experience: List[Experience] = []
    skills: List[str] = []
    languages: List[Language] = []
    certifications: List[str] = []

class UserCreate(BaseModel):
    firebase_uid: str
    email: str = ""
    display_name: str = ""

@app.post("/api/extract-cv")
async def extract_cv(file: UploadFile = File(...)):
    """
    Extract CV data from uploaded file using Gemini AI.
    This endpoint only handles file parsing and data extraction.
    """
    try:
        logger.info(f"Processing file: {file.filename}")
        
        # Read file content based on type
        content = ""
        if file.filename.endswith('.pdf'):
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                temp_file.write(await file.read())
                temp_file_path = temp_file.name
            
            with pdfplumber.open(temp_file_path) as pdf:
                content = "\n".join(page.extract_text() for page in pdf.pages)
            os.unlink(temp_file_path)
            
        elif file.filename.endswith('.docx'):
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                temp_file.write(await file.read())
                temp_file_path = temp_file.name
            
            doc = Document(temp_file_path)
            content = "\n".join(paragraph.text for paragraph in doc.paragraphs)
            os.unlink(temp_file_path)
            
        elif file.filename.endswith('.txt'):
            content = (await file.read()).decode()
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")

        # Clean and prepare the text
        content = re.sub(r'\s+', ' ', content).strip()
        
        # Prepare the prompt for Gemini
        prompt = f"""
        Extract the following information from this CV in a structured format:
        1. Personal Information (name, email, phone, location, LinkedIn, GitHub)
        2. Summary/Profile
        3. Education (institution, degree, dates)
        4. Work Experience (company, position, dates, highlights)
        5. Skills
        6. Languages
        7. Certifications

        Format the response as a JSON object with these exact keys:
        {{
            "personalInfo": {{ "name": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "" }},
            "summary": "",
            "education": [{{ "institution": "", "degree": "", "startDate": "", "endDate": "" }}],
            "experience": [{{ "company": "", "position": "", "startDate": "", "endDate": "", "highlights": [] }}],
            "skills": [],
            "languages": [{{ "name": "", "proficiency": "" }}],
            "certifications": []
        }}

        CV Content:
        {content}
        """

        # Get response from Gemini
        response = model.generate_content(prompt)
        
        # Extract and validate JSON from response
        try:
            # Find JSON in the response
            json_match = re.search(r'({[\s\S]*})', response.text)
            if not json_match:
                raise ValueError("No JSON found in response")
                
            extracted_data = json.loads(json_match.group(1))
            logger.info("Successfully extracted CV data")
            
            return {
                "success": True,
                "data": extracted_data,
                "message": "CV data extracted successfully"
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {str(e)}")
            logger.error(f"Raw response: {response.text}")
            raise HTTPException(status_code=500, detail="Failed to parse extracted data")
            
    except Exception as e:
        logger.error(f"Error processing CV: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to process CV: {str(e)}")

@app.post("/api/cv-profile")
async def save_cv_profile(profile: CVProfile):
    logger.info(f"Saving CV profile for user: {profile.firebase_uid}")
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Get user ID from firebase_uid
            cur.execute("SELECT id FROM users WHERE firebase_uid = %s", (profile.firebase_uid,))
            user = cur.fetchone()
            if not user:
                logger.error(f"User not found for firebase_uid: {profile.firebase_uid}")
                raise HTTPException(status_code=404, detail="User not found")
            
            user_id = user[0]
            logger.info(f"Found user_id: {user_id}")

            # Convert lists to PostgreSQL arrays
            skills_array = profile.skills if profile.skills else []
            certifications_array = profile.certifications if profile.certifications else []

            # Log the data being saved
            logger.info("Saving CV data:", {
                "user_id": user_id,
                "name": profile.personalInfo.name,
                "email": profile.personalInfo.email,
                "skills": skills_array,
                "education_count": len(profile.education),
                "experience_count": len(profile.experience)
            })

            # Update or insert CV profile
            cur.execute("""
                INSERT INTO parsed_cv_profiles (
                    user_id,
                    name,
                    email,
                    phone,
                    linkedin,
                    github,
                    location,
                    summary,
                    education,
                    experience,
                    skills,
                    languages,
                    certifications
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (user_id) 
                DO UPDATE SET
                    name = EXCLUDED.name,
                    email = EXCLUDED.email,
                    phone = EXCLUDED.phone,
                    linkedin = EXCLUDED.linkedin,
                    github = EXCLUDED.github,
                    location = EXCLUDED.location,
                    summary = EXCLUDED.summary,
                    education = EXCLUDED.education,
                    experience = EXCLUDED.experience,
                    skills = EXCLUDED.skills,
                    languages = EXCLUDED.languages,
                    certifications = EXCLUDED.certifications
                RETURNING id
            """, (
                user_id,
                profile.personalInfo.name,
                profile.personalInfo.email,
                profile.personalInfo.phone,
                profile.personalInfo.linkedin,
                profile.personalInfo.github,
                profile.personalInfo.location,
                profile.summary,
                json.dumps([edu.dict() for edu in profile.education]),
                json.dumps([exp.dict() for exp in profile.experience]),
                skills_array,
                json.dumps([lang.dict() for lang in profile.languages]),
                certifications_array
            ))
            
            result = cur.fetchone()
            conn.commit()
            logger.info(f"CV profile saved successfully with id: {result[0]}")

            return {
                "success": True,
                "message": "CV profile saved successfully",
                "data": {
                    "id": result[0],
                    "firebase_uid": profile.firebase_uid
                }
            }

    except psycopg2.Error as e:
        logger.error(f"Database error while saving CV profile: {str(e)}")
        logger.error(traceback.format_exc())
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        logger.error(f"Error saving CV profile: {str(e)}")
        logger.error(traceback.format_exc())
        if 'conn' in locals():
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save CV profile: {str(e)}")
    finally:
        if 'conn' in locals():
            conn.close()

@app.get("/api/cv-profile/{firebase_uid}")
async def get_cv_profile(firebase_uid: str):
    logger.info(f"Fetching CV profile for user: {firebase_uid}")
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # First get the user's ID
            cur.execute("SELECT id FROM users WHERE firebase_uid = %s", (firebase_uid,))
            user = cur.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            # Get the CV profile
            cur.execute("""
                SELECT * FROM parsed_cv_profiles WHERE user_id = %s
            """, (user['id'],))
            
            result = cur.fetchone()
            if not result:
                return {
                    "success": True,
                    "message": "No CV profile found",
                    "data": None
                }

            # Format the data as expected by the frontend
            formatted_data = {
                "firebase_uid": firebase_uid,
                "summary": result['summary'],
                "personalInfo": {
                    "name": result['name'] or "",
                    "email": result['email'] or "",
                    "phone": result['phone'] or "",
                    "linkedin": result['linkedin'] or "",
                    "github": result['github'] or "",
                    "location": result['location'] or "",
                    "summary": result['summary'] or ""
                },
                "education": result['education'] if result['education'] else [],
                "experience": result['experience'] if result['experience'] else [],
                "skills": result['skills'] if result['skills'] else [],
                "languages": result['languages'] if result['languages'] else [],
                "certifications": result['certifications'] if result['certifications'] else []
            }

            return {
                "success": True,
                "message": "CV profile retrieved successfully",
                "data": formatted_data
            }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching CV profile: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to fetch CV profile: {str(e)}")
    finally:
        conn.close()

@app.post("/api/users")
async def create_user(user: UserCreate):
    logger.info(f"Creating user with firebase_uid: {user.firebase_uid}, email: {user.email}")
    try:
        if not user.email:
            logger.error("Email is required")
            raise HTTPException(status_code=400, detail="Email is required")
            
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                logger.info("Inserting user into database")
                # Insert user with additional fields
                cur.execute("""
                    INSERT INTO users (
                        firebase_uid,
                        email,
                        display_name,
                        created_at
                    )
                    VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
                    ON CONFLICT (firebase_uid) 
                    DO UPDATE SET
                        email = EXCLUDED.email,
                        display_name = EXCLUDED.display_name
                    RETURNING id, firebase_uid, email, display_name
                """, (user.firebase_uid, user.email, user.display_name))
                
                result = cur.fetchone()
                if not result:
                    logger.error("Failed to create or update user - no result returned")
                    raise HTTPException(status_code=500, detail="Failed to create or update user")
                
                conn.commit()
                logger.info(f"User created/updated successfully. ID: {result['id']}, Email: {result['email']}")
                
                return {
                    "success": True,
                    "message": "User created successfully",
                    "data": {
                        "id": result['id'],
                        "firebase_uid": result['firebase_uid'],
                        "email": result['email'],
                        "display_name": result['display_name']
                    }
                }
                
        except psycopg2.Error as e:
            logger.error(f"Database error while creating user: {str(e)}")
            logger.error(traceback.format_exc())
            conn.rollback()
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        finally:
            conn.close()
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error creating user: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)