
from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Applicant(Base):
    __tablename__ = "applicants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, index=True)
    phone = Column(String, nullable=True)
    resume_path = Column(String)
    skills = Column(JSON, nullable=True)  # Extracted skills from resume
    total_experience = Column(Integer, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="applicant_profile")
    interviews = relationship("Interview", back_populates="applicant")
    offers = relationship("OfferLetter", back_populates="applicant")
