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

# Configure logger
logger = logging.getLogger("resume_parser")
logging.basicConfig(level=logging.INFO)

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

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Updated Pydantic Models with Languages
class Language(BaseModel):
    name: str = ""
    proficiency: str = ""

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            name=data.get("name", "") or "",
            proficiency=data.get("proficiency", "") or ""
        )

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
        return cls(
            name=data.get("name", "") or "",
            email=data.get("email", "") or "",
            phone=data.get("phone", "") or "",
            linkedin=data.get("linkedin", "") or "",
            github=data.get("github", "") or "",
            location=data.get("location", "") or "",
            summary=data.get("summary", "") or ""
        )

class Education(BaseModel):
    institution: str = ""
    degree: str = ""
    startDate: str = ""
    endDate: str = ""

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            institution=data.get("institution", "") or "",
            degree=data.get("degree", "") or "",
            startDate=data.get("startDate", "") or "",
            endDate=data.get("endDate", "Present") or "Present"
        )

class Experience(BaseModel):
    position: str = ""
    company: str = ""
    startDate: str = ""
    endDate: str = ""
    highlights: List[str] = []

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            position=data.get("position", "") or "",
            company=data.get("company", "") or "",
            startDate=data.get("startDate", "") or "",
            endDate=data.get("endDate", "Present") or "Present",
            highlights=data.get("highlights", []) or []
        )

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
            personal_info=PersonalInfo.from_dict(data.get("personal_info", {})),
            education=[Education.from_dict(edu) for edu in data.get("education", [])],
            experience=[Experience.from_dict(exp) for exp in data.get("experience", [])],
            skills=data.get("skills", []) or [],
            languages=[Language.from_dict(lang) for lang in data.get("languages", [])],
            certifications=data.get("certifications", []) or []
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

async def fast_parse_with_gemini(text: str) -> dict:
    """Single optimized API call with language extraction"""
    prompt = f"""
    Extract resume data in this JSON format from the text below. For dates, use YYYY-MM-DD format or 'Present' for current positions:

    {{
        "personal_info": {{
            "name": "Full Name",
            "email": "email@example.com",
            "phone": "+1234567890",
            "linkedin": "profile-url",
            "github": "profile-url",
            "location": "City, Country",
            "summary": "A brief professional summary highlighting key qualifications and career objectives"
        }},
        "education": [
            {{
                "institution": "University Name",
                "degree": "Degree Name",
                "startDate": "YYYY-MM-DD",
                "endDate": "YYYY-MM-DD or Present"
            }}
        ],
        "experience": [
            {{
                "position": "Job Title",
                "company": "Company Name",
                "startDate": "YYYY-MM-DD",
                "endDate": "YYYY-MM-DD or Present",
                "highlights": [
                    "Achievement 1",
                    "Achievement 2"
                ]
            }}
        ],
        "skills": ["Skill 1", "Skill 2"],
        "languages": [
            {{
                "name": "Language Name",
                "proficiency": "Native/Fluent/Professional/Intermediate/Basic"
            }}
        ],
        "certifications": ["Cert 1", "Cert 2"]
    }}

    Rules:
    1. Keep responses under 1024 tokens
    2. Use exact values from resume
    3. For current positions/education, use 'Present' as the end date
    4. Format dates as YYYY-MM-DD
    5. Include language proficiency levels
    6. Return ONLY the JSON, no additional text
    7. If a field is not found, use an empty string or empty list
    8. Never return null values

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
        
        # Parse JSON and create ParsedResume object with data cleaning
        data = json.loads(json_str)
        return ParsedResume.from_dict(data).dict()
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {str(e)}\nResponse text: {response.text}")
        raise HTTPException(500, f"Failed to parse AI response: {str(e)}")

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