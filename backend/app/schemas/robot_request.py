
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RobotRequestBase(BaseModel):
    robot_type: str
    trading_pairs: str
    timeframe: str
    risk_level: int

class RobotRequestCreate(RobotRequestBase):
    user_id: str

class RobotRequestResponse(RobotRequestBase):
    id: str
    user_id: str
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
