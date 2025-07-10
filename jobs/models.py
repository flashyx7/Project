
from sqlalchemy import Column, String, Text, JSON, Integer, ForeignKey
from sqlalchemy.orm import relationship
from core.models import BaseModel

class JobPosition(BaseModel):
    __tablename__ = "job_positions"
    
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    skills = Column(JSON, nullable=False)  # List of required skills
    company_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    company = relationship("User", back_populates="job_positions")

# Add relationship to User model
from auth.models import User
User.job_positions = relationship("JobPosition", back_populates="company")
