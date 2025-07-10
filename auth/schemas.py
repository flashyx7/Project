
from pydantic import BaseModel
from typing import Optional
from auth.models import UserRole

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str
    role: UserRole

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: int
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict
