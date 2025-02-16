from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class EducationEntry(BaseModel):
    institution: str
    degree: str
    start_date: str
    end_date: Optional[str] = None

class ExperienceEntry(BaseModel):
    company: str
    position: str
    start_date: str
    end_date: Optional[str] = None
    highlights: List[str] = []

class LanguageEntry(BaseModel):
    name: str
    proficiency: str

class PersonalInfo(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    location: Optional[str] = None

class CVProfileBase(BaseModel):
    summary: Optional[str] = None
    personal_info: PersonalInfo
    education: List[EducationEntry] = []
    experience: List[ExperienceEntry] = []
    skills: List[str] = []
    languages: List[LanguageEntry] = []
    certifications: List[str] = []

class CVProfileCreate(CVProfileBase):
    user_id: str

class CVProfileResponse(CVProfileBase):
    id: int
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True
