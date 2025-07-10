
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ApplicantCreate(BaseModel):
    name: str
    email: str

class Applicant(BaseModel):
    id: int
    user_id: int
    name: str
    email: str
    resume_text: Optional[str]
    skills: Optional[List[str]]
    created_at: datetime
    
    class Config:
        from_attributes = True
