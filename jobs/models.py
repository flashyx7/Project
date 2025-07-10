
from sqlalchemy import Column, Integer, String, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    skills = Column(JSON)  # List of required skills
    salary = Column(Float, nullable=True)
    location = Column(String, nullable=True)
    company_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    company = relationship("User", back_populates="jobs")
    interviews = relationship("Interview", back_populates="position")
    offers = relationship("OfferLetter", back_populates="position")
