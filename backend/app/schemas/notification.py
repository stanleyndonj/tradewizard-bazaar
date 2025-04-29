from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class NotificationBase(BaseModel):
    user_id: str
    title: str
    content: str
    is_read: bool = False
    notification_type: str = "general"  # general, alert, message, system

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True