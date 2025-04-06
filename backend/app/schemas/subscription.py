
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class SubscriptionPlanBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    currency: str = "USD"
    interval: str
    features: Optional[List[str]] = None

class SubscriptionPlanCreate(SubscriptionPlanBase):
    pass

class SubscriptionPlanUpdate(SubscriptionPlanBase):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    interval: Optional[str] = None
    features: Optional[List[str]] = None

class SubscriptionPlanResponse(SubscriptionPlanBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SubscriptionBase(BaseModel):
    plan_id: str
    amount: float
    currency: str
    payment_method: str

class SubscriptionCreate(SubscriptionBase):
    user_id: Optional[str] = None

class SubscriptionUpdate(BaseModel):
    status: Optional[str] = None
    is_active: Optional[bool] = None
    end_date: Optional[datetime] = None

class SubscriptionResponse(SubscriptionBase):
    id: str
    user_id: str
    status: str
    start_date: datetime
    end_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_active: bool

    class Config:
        from_attributes = True
