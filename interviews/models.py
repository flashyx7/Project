
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from core.models import BaseModel
import enum

class InterviewStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Interview(BaseModel):
    __tablename__ = "interviews"
    
    applicant_id = Column(Integer, ForeignKey("applicants.id"), nullable=False)
    position_id = Column(Integer, ForeignKey("job_positions.id"), nullable=False)
    date_time = Column(DateTime, nullable=False)
    status = Column(Enum(InterviewStatus), default=InterviewStatus.SCHEDULED)
    
    applicant = relationship("Applicant")
    position = relationship("JobPosition")
