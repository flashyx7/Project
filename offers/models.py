
from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship
from core.models import BaseModel

class OfferLetter(BaseModel):
    __tablename__ = "offer_letters"
    
    applicant_id = Column(Integer, ForeignKey("applicants.id"), nullable=False)
    position_id = Column(Integer, ForeignKey("job_positions.id"), nullable=False)
    pdf_path = Column(String(500), nullable=False)
    
    applicant = relationship("Applicant")
    position = relationship("JobPosition")
