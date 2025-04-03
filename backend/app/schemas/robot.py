
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class RobotBase(BaseModel):
    name: str
    description: str
    type: str
    price: float
    currency: str = "USD"
    category: str
    features: List[str]
    image_url: Optional[str] = None

class RobotCreate(RobotBase):
    pass

class RobotUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    category: Optional[str] = None
    features: Optional[List[str]] = None
    image_url: Optional[str] = None
    download_url: Optional[str] = None

class RobotResponse(RobotBase):
    id: str
    download_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
