from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel, Field
import google.generativeai as genai
import pdfplumber
from docx import Document
import io
import logging
import json
import re
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logger
logger = logging.getLogger("resume_parser")
logging.basicConfig(level=logging.INFO)

# Initialize Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

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

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Updated Pydantic Models with Languages
class PersonalInfo(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    linkedin: str = ""
    github: str = ""
    location: str = ""

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            name=data.get("name", "") or "",
            email=data.get("email", "") or "",
            phone=data.get("phone", "") or "",
            linkedin=data.get("linkedin", "") or "",
            github=data.get("github", "") or "",
            location=data.get("location", "") or ""
        )

class Education(BaseModel):
    institution: str = ""
    degree: str = ""
    dates: str = ""

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            institution=data.get("institution", "") or "",
            degree=data.get("degree", "") or "",
            dates=data.get("dates", "") or ""
        )

class Experience(BaseModel):
    position: str = ""
    company: str = ""
    dates: str = ""
    highlights: List[str] = []

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            position=data.get("position", "") or "",
            company=data.get("company", "") or "",
            dates=data.get("dates", "") or "",
            highlights=data.get("highlights", []) or []
        )

class ParsedResume(BaseModel):
    personal_info: PersonalInfo = PersonalInfo()
    education: List[Education] = []
    experience: List[Experience] = []
    skills: List[str] = []
    languages: List[str] = []
    certifications: List[str] = []
    summary: str = ""

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            personal_info=PersonalInfo.from_dict(data.get("personal_info", {})),
            education=[Education.from_dict(edu) for edu in data.get("education", [])],
            experience=[Experience.from_dict(exp) for exp in data.get("experience", [])],
            skills=data.get("skills", []) or [],
            languages=data.get("languages", []) or [],
            certifications=data.get("certifications", []) or [],
            summary=data.get("summary", "") or ""
        )

async def extract_text(file: UploadFile) -> str:
    """Optimized parallel text extraction"""
    try:
        content = await file.read()
        
        if file.filename.endswith('.pdf'):
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                text = "\n".join(page.extract_text() for page in pdf.pages if page.extract_text())
                return text
        elif file.filename.endswith('.docx'):
            doc = Document(io.BytesIO(content))
            return "\n".join(para.text for para in doc.paragraphs)
        else:
            raise HTTPException(400, "Unsupported file format. Please upload PDF or DOCX.")
            
        return ""
    except Exception as e:
        logger.error(f"Text extraction error: {str(e)}")
        raise HTTPException(500, f"Text extraction failed: {str(e)}")

async def fast_parse_with_gemini(text: str) -> ParsedResume:
    """Single optimized API call with language extraction"""
    prompt = f"""
    Extract resume data in this JSON format from the text below:
    {{
        "personal_info": {{
            "name": "Full Name",
            "email": "email@example.com",
            "phone": "+1234567890",
            "linkedin": "profile-url",
            "github": "profile-url",
            "location": "City, Country"
        }},
        "education": [
            {{
                "institution": "University Name", 
                "degree": "Degree Name",
                "dates": "MM/YYYY - MM/YYYY"
            }}
        ],
        "experience": [
            {{
                "position": "Job Title",
                "company": "Company Name",
                "dates": "MM/YYYY - MM/YYYY",
                "highlights": ["Achievement 1", "Achievement 2"]
            }}
        ],
        "skills": ["Skill 1", "Skill 2"],
        "languages": ["Language 1", "Language 2"],
        "certifications": ["Cert 1", "Cert 2"],
        "summary": "Brief professional summary"
    }}

    Rules:
    1. Keep responses under 1024 tokens
    2. Prioritize speed over completeness
    3. Use exact values from resume
    4. Include languages section
    5. Return ONLY the JSON, no additional text or explanation
    6. If a field is not found, use an empty string or empty list as appropriate
    7. Never return null values

    Resume Text:
    {text}
    """
    
    try:
        # Generate content with Gemini
        response = model.generate_content(prompt)
        response.resolve()
        
        # Clean the response text
        json_str = response.text.strip()
        if "```json" in json_str:
            json_str = json_str.split("```json")[-1].split("```")[0]
        json_str = json_str.strip()
        
        # Log the response for debugging
        logger.info(f"Gemini Response: {json_str}")
        
        # Parse JSON and create ParsedResume object with data cleaning
        data = json.loads(json_str)
        return ParsedResume.from_dict(data)
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {str(e)}\nResponse text: {response.text}")
        raise HTTPException(500, f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        logger.error(f"AI processing error: {str(e)}")
        raise HTTPException(500, f"AI processing failed: {str(e)}")

@app.post("/parse-resume", response_model=ParsedResume)
async def parse_resume(file: UploadFile = File(...)):
    """Ultra-fast parsing endpoint"""
    try:
        # Extract text from file
        text = await extract_text(file)
        logger.info(f"Extracted text length: {len(text)}")
        
        if not text.strip():
            raise HTTPException(400, "No text could be extracted from the file")
            
        # Parse with Gemini
        result = await fast_parse_with_gemini(text)
        return result
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(500, f"Processing failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)