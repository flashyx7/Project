
from sqlalchemy import Column, Integer, String, Boolean, Enum
from sqlalchemy.orm import relationship
from database import Base
import enum

class UserRole(enum.Enum):
    company = "company"
    applicant = "applicant"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(UserRole))
    is_active = Column(Boolean, default=True)
    
    # Relationships
    jobs = relationship("JobPosition", back_populates="company")
    applicant_profile = relationship("Applicant", back_populates="user", uselist=False)
