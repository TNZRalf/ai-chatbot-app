from sqlalchemy import Column, Integer, String, JSON, DateTime, func
from .database import Base

class CVProfile(Base):
    __tablename__ = "parsed_cv_profiles"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String, unique=True, index=True, nullable=False)
    summary = Column(String)
    personal_info = Column(JSON)  # name, email, phone, linkedin, github, location
    education = Column(JSON)      # list of education entries
    experience = Column(JSON)     # list of experience entries
    skills = Column(JSON)         # list of skills
    languages = Column(JSON)      # list of language proficiencies
    certifications = Column(JSON) # list of certifications
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
