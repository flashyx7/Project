
from pydantic import BaseModel
from datetime import datetime

class OfferLetterCreate(BaseModel):
    applicant_id: int
    position_id: int
    salary: float = None
    start_date: str = None

class OfferLetter(BaseModel):
    id: int
    applicant_id: int
    position_id: int
    pdf_path: str
    created_at: datetime
    
    class Config:
        from_attributes = True
