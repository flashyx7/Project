
from pydantic import BaseModel
from typing import List
from datetime import datetime

class JobPositionCreate(BaseModel):
    title: str
    description: str
    skills: List[str]

class JobPositionUpdate(BaseModel):
    title: str = None
    description: str = None
    skills: List[str] = None

class JobPosition(BaseModel):
    id: int
    title: str
    description: str
    skills: List[str]
    company_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
