
from sqlalchemy import Column, String, Text, JSON, Integer, ForeignKey
from sqlalchemy.orm import relationship
from core.models import BaseModel

class Applicant(BaseModel):
    __tablename__ = "applicants"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    email = Column(String(200), nullable=False)
    resume_text = Column(Text, nullable=True)
    skills = Column(JSON, nullable=True)  # List of extracted skills
    
    user = relationship("User", back_populates="applicant_profile")

# Add relationship to User model
from auth.models import User
User.applicant_profile = relationship("Applicant", back_populates="user", uselist=False)
