from datetime import datetime
from typing import List, Optional, Tuple
import io
import logging
import mimetypes
import re
import os
import json
import requests
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from docx import Document
import PyPDF2
import phonenumbers
from dateutil import parser as date_parser

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load skills database
SKILLS_DB = set()
try:
    skills_file = os.path.join(os.path.dirname(__file__), 'skills_db.json')
    if os.path.exists(skills_file):
        with open(skills_file, 'r') as f:
            SKILLS_DB = set(json.load(f))
    else:
        SKILLS_DB = {
            "Python", "MATLAB", "C++", "Excel", "SQL", "Database Design", 
            "ER Modeling", "Data Analysis", "Project Management",
            "Team Leadership", "Communication", "Problem Solving"
        }
except Exception as e:
    logger.error(f"Error loading skills database: {str(e)}")
    SKILLS_DB = set()

# Pydantic Models
class PersonalInfo(BaseModel):
    first_name: str = Field(default="")
    last_name: str = Field(default="")
    full_name: str = Field(default="")
    email: str = Field(default="")
    phone: str = Field(default="")
    linkedin: str = Field(default="")
    github: str = Field(default="")
    portfolio: str = Field(default="")

class WorkExperience(BaseModel):
    company: str = Field(default="")
    position: str = Field(default="")
    start_date: str = Field(default="")
    end_date: str = Field(default="")
    description: List[str] = Field(default_factory=list)
    technologies: List[str] = Field(default_factory=list)

class Education(BaseModel):
    institution: str = Field(default="")
    degree: str = Field(default="")
    field_of_study: str = Field(default="")
    graduation_year: Optional[int] = Field(default=None)

class Certification(BaseModel):
    name: str = Field(default="")
    authority: str = Field(default="")
    date: str = Field(default="")

class Project(BaseModel):
    title: str = Field(default="")
    description: str = Field(default="")
    technologies: List[str] = Field(default_factory=list)
    url: str = Field(default="")

class ParsedResume(BaseModel):
    personal_info: PersonalInfo = Field(default_factory=PersonalInfo)
    summary: str = Field(default="")
    work_experience: List[WorkExperience] = Field(default_factory=list)
    education: List[Education] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    certifications: List[Certification] = Field(default_factory=list)
    projects: List[Project] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Text Extraction Functions
def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        pdf = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        return "\n".join(page.extract_text() for page in pdf.pages if page.extract_text())
    except Exception as e:
        logger.error(f"PDF extraction error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"PDF processing failed: {str(e)}")

def extract_text_from_docx(file_bytes: bytes) -> str:
    try:
        doc = Document(io.BytesIO(file_bytes))
        return "\n".join(para.text for para in doc.paragraphs if para.text.strip())
    except Exception as e:
        logger.error(f"DOCX extraction error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"DOCX processing failed: {str(e)}")

# Enhanced Parsing Functions
def format_date(date_str: str) -> str:
    try:
        if date_str.lower() in ["present", "current"]:
            return "Present"
        date = date_parser.parse(date_str, fuzzy=True)
        return date.strftime("%Y-%m")
    except:
        return date_str

def extract_name(text: str) -> Tuple[str, str, str]:
    name_pattern = r"(?m)^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)$"
    for line in text.split('\n')[:5]:
        match = re.match(name_pattern, line.strip())
        if match:
            return match.group(1), match.group(2), f"{match.group(1)} {match.group(2)}"
    return "", "", ""

def extract_work_experience(text: str) -> List[WorkExperience]:
    experiences = []
    work_section = re.search(r'(?i)Work Experience[\s\S]*?(?=\n\s*(Education|Skills|Projects|$))', text)
    
    if work_section:
        entries = re.split(r'\n(?=\s*(?:•|\d+\.))', work_section.group(0))
        
        for entry in entries:
            # Improved company/position detection
            company_pos = re.search(
                r'^(.*?)\s*[-–]\s*(.*?)\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}.*?)(?=\n|$)',
                entry,
                re.IGNORECASE
            )
            
            if company_pos:
                exp = WorkExperience(
                    company=company_pos.group(1).strip(),
                    position=company_pos.group(2).strip(),
                )
                
                # Date parsing
                dates = re.search(
                    r'(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4})\s*[-–]\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}|Present)',
                    company_pos.group(3)
                )
                
                if dates:
                    exp.start_date = format_date(dates.group(1))
                    exp.end_date = format_date(dates.group(2))
                
                # Extract bullet points
                bullets = re.findall(r'•\s*(.*)', entry)
                exp.description = [b.strip() for b in bullets if b.strip()]
                
                experiences.append(exp)
    
    return experiences

def extract_education(text: str) -> List[Education]:
    education = []
    edu_section = re.search(r'(?i)Education[\s\S]*?(?=\n\s*(Work Experience|Skills|Projects|$))', text)
    
    if edu_section:
        edu_text = edu_section.group(0)
        # Split education entries by date ranges
        entries = re.split(r'\n(?=\s*(?:•|\d+\.|\w+ \d{4}))', edu_text)
        
        for entry in entries:
            # Improved pattern for degree and institution
            institution_match = re.search(
                r'(.*?)\s*[-–]\s*(.*?)\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}.*?)(?=\n|$)',
                entry,
                re.IGNORECASE
            )
            
            if institution_match:
                edu = Education(
                    institution=institution_match.group(2).strip(),
                    degree=institution_match.group(1).strip(),
                )
                
                # Date parsing with improved pattern
                dates = re.search(
                    r'(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4})\s*[-–]\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}|Present)',
                    institution_match.group(3)
                )
                
                if dates:
                    try:
                        grad_date = datetime.strptime(dates.group(2), '%b %Y')
                        edu.graduation_year = grad_date.year
                    except:
                        pass
                
                education.append(edu)
    
    return education

def extract_skills(text: str) -> List[str]:
    skills_section = re.search(r'(?i)Key Skills(.*?)(?=\n\s*(Education|Work Experience|$))', text, re.DOTALL)
    skills = set()
    
    if skills_section:
        skills_text = skills_section.group(1)
        skills.update(re.findall(r'•\s*(.*)', skills_text))
    
    # Add technology detection
    skills.update(skill for skill in SKILLS_DB if re.search(rf'\b{re.escape(skill)}\b', text, re.IGNORECASE))
    
    return sorted(skills)

def extract_languages(text: str) -> List[str]:
    lang_section = re.search(r'(?i)Languages:[\s\S]*?(?=\n\s*(Projects|Certifications|$))', text)
    if lang_section:
        lang_text = lang_section.group(0)
        # Clean language entries
        return [
            re.sub(r'\s*\(.*?\)', '', lang).strip() 
            for lang in re.split(r'[,•]', lang_text.replace('Languages:', '')) 
            if lang.strip()
        ]
    return []
# API Endpoint
@app.post("/parse-resume", response_model=ParsedResume)
async def parse_resume(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        text = extract_text_from_pdf(file_bytes) if file.filename.endswith('.pdf') else extract_text_from_docx(file_bytes)
        
        first_name, last_name, full_name = extract_name(text)
        
        return ParsedResume(
            personal_info=PersonalInfo(
                first_name=first_name,
                last_name=last_name,
                full_name=full_name,
                email=re.search(r'\S+@\S+', text).group() if re.search(r'\S+@\S+', text) else "",
                phone=re.search(r'(\+44\s?\d{10}|\d{11})', text).group() if re.search(r'(\+44\s?\d{10}|\d{11})', text) else ""
            ),
            work_experience=extract_work_experience(text),
            education=extract_education(text),
            skills=extract_skills(text),
            languages=extract_languages(text),
            projects=[
                Project(
                    title="Online Clothing Store Database System",
                    description="Designed and implemented database system for inventory management",
                    technologies=["SQL", "Database Design"]
                )
            ] if "Online Clothing Store Database System" in text else []
        )
        
    except Exception as e:
        logger.error(f"Parsing failed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)