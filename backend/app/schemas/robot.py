
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

class RobotResponse(RobotBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
