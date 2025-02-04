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

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app's URL
    allow_credentials=False,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
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

# Updated Pydantic Models with Languages
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
            endDate=data.get("endDate", "") or ""
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
            endDate=data.get("endDate", "") or "",
            highlights=data.get("highlights", []) or []
        )

class Language(BaseModel):
    name: str = ""
    proficiency: str = ""

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            name=data.get("name", "") or "",
            proficiency=data.get("proficiency", "") or ""
        )

class ParsedResume(BaseModel):
    personal_info: PersonalInfo = PersonalInfo()
    education: List[Education] = []
    experience: List[Experience] = []
    skills: List[str] = []
    languages: List[Language] = []
    certifications: List[str] = []
    summary: str = ""

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            personal_info=PersonalInfo.from_dict(data.get("personal_info", {})),
            education=[Education.from_dict(edu) for edu in data.get("education", [])],
            experience=[Experience.from_dict(exp) for exp in data.get("experience", [])],
            skills=data.get("skills", []) or [],
            languages=[Language.from_dict(lang) for lang in data.get("languages", [])],
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
        "skills": [
            "Skill 1",
            "Skill 2"
        ],
        "languages": [
            {{
                "name": "Language Name",
                "proficiency": "Native/Fluent/Professional/Intermediate/Basic"
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
        "education": [
            {{
                "institution": "University Name",
                "degree": "Degree Name",
                "startDate": "YYYY-MM-DD",
                "endDate": "YYYY-MM-DD or Present"
            }}
        ]
    }}

    Text to parse:
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
        return ParsedResume.from_dict(data).dict()
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {str(e)}\nResponse text: {response.text}")
        raise HTTPException(500, f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        logger.error(f"AI processing error: {str(e)}")
        raise HTTPException(500, f"AI processing failed: {str(e)}")

@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    try:
        logger.info(f"Received file: {file.filename}, content_type: {file.content_type}")
        
        # Validate file type
        if not file.content_type in ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}. Please upload a PDF or DOCX file.")
        
        # Extract text from the file
        try:
            text = await extract_text(file)
            logger.info(f"Successfully extracted text from {file.filename}")
        except Exception as e:
            logger.error(f"Error extracting text: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error extracting text from file: {str(e)}")
        
        # Parse the text with Gemini
        try:
            parsed_data = await fast_parse_with_gemini(text)
            logger.info(f"Successfully parsed resume data for {file.filename}")
            return parsed_data
        except Exception as e:
            logger.error(f"Error parsing with Gemini: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error parsing resume with AI: {str(e)}")
            
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)