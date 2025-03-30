
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class RobotRequestBase(BaseModel):
    robot_type: str
    trading_pairs: str
    timeframe: str
    risk_level: int
    
    # New fields
    bot_name: Optional[str] = None
    market: Optional[str] = None
    stake_amount: Optional[float] = None
    contract_type: Optional[str] = None
    duration: Optional[str] = None
    prediction: Optional[str] = None
    currency: Optional[str] = None
    trading_strategy: Optional[str] = None
    
    # MT5 specific fields
    account_credentials: Optional[str] = None
    volume: Optional[float] = None
    order_type: Optional[str] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    entry_rules: Optional[str] = None
    exit_rules: Optional[str] = None
    risk_management: Optional[str] = None
    additional_parameters: Optional[str] = None

class RobotRequestCreate(RobotRequestBase):
    pass

class RobotRequestUpdate(BaseModel):
    status: Optional[str] = None
    is_delivered: Optional[bool] = None
    download_url: Optional[str] = None
    notes: Optional[str] = None
    progress: Optional[int] = None  # Progress percentage (0-100)

class RobotRequestResponse(RobotRequestBase):
    id: str
    user_id: str
    status: str
    is_delivered: bool = False
    delivery_date: Optional[datetime] = None
    download_url: Optional[str] = None
    notes: Optional[str] = None
    progress: Optional[int] = None  # Progress percentage (0-100)
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
