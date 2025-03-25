
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    is_admin: bool
    role: Optional[str] = "user"
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
