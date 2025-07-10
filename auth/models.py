
from sqlalchemy import Column, String, Enum
from core.models import BaseModel
import enum

class UserRole(str, enum.Enum):
    COMPANY = "company"
    APPLICANT = "applicant"

class User(BaseModel):
    __tablename__ = "users"
    
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
