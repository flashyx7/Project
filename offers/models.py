
from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class OfferLetter(Base):
    __tablename__ = "offer_letters"

    id = Column(Integer, primary_key=True, index=True)
    applicant_id = Column(Integer, ForeignKey("applicants.id"))
    position_id = Column(Integer, ForeignKey("jobs.id"))
    salary = Column(Float)
    start_date = Column(Date)
    pdf_path = Column(String)
    
    # Relationships
    applicant = relationship("Applicant", back_populates="offers")
    position = relationship("Job", back_populates="offers")
