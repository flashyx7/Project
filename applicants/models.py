
from sqlalchemy import Column, String, Text, JSON, Integer, ForeignKey, Float
from sqlalchemy.orm import relationship
from core.models import BaseModel

class Applicant(BaseModel):
    __tablename__ = "applicants"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    email = Column(String(200), nullable=False)
    resume_text = Column(Text, nullable=True)
    skills = Column(JSON, nullable=True)  # List of extracted skills
    
    # Enhanced fields from ResumeParser
    phone = Column(String(50), nullable=True)
    education = Column(JSON, nullable=True)  # List of education details
    experience = Column(JSON, nullable=True)  # List of work experience
    company_names = Column(JSON, nullable=True)  # List of companies worked at
    designations = Column(JSON, nullable=True)  # List of job titles/designations
    degrees = Column(JSON, nullable=True)  # List of degrees
    college_names = Column(JSON, nullable=True)  # List of colleges/universities
    total_experience = Column(Float, nullable=True)  # Total years of experience
    
    user = relationship("User", back_populates="applicant_profile")

# Add relationship to User model
from auth.models import User
User.applicant_profile = relationship("Applicant", back_populates="user", uselist=False)
