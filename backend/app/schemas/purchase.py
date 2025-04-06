
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PurchaseBase(BaseModel):
    amount: float
    currency: str
    payment_method: str

class PurchaseCreate(PurchaseBase):
    robot_id: str

class PurchaseUpdate(BaseModel):
    status: Optional[str] = None
    
class PurchaseResponse(PurchaseBase):
    id: str
    user_id: str
    robot_id: str
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
