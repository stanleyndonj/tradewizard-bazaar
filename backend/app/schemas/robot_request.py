
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class RobotRequestBase(BaseModel):
    robot_type: str
    trading_pairs: str
    timeframe: str
    risk_level: int

class RobotRequestCreate(RobotRequestBase):
    pass

class RobotRequestUpdate(BaseModel):
    status: Optional[str] = None
    is_delivered: Optional[bool] = None
    notes: Optional[str] = None

class RobotRequestResponse(RobotRequestBase):
    id: str
    user_id: str
    status: str
    is_delivered: bool = False
    delivery_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
