from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class NotificationBase(BaseModel):
    type: str
    title: str
    content: str
    user_id: str
    is_read: bool = False
    related_id: Optional[str] = None


class NotificationCreate(NotificationBase):
    pass


class Notification(NotificationBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class MessageBase(BaseModel):
    content: str
    is_read: bool = False
    sender: str
    sender_id: str


class MessageCreate(MessageBase):
    conversation_id: str


class Message(MessageBase):
    id: str
    conversation_id: str
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True


class ConversationBase(BaseModel):
    title: Optional[str] = None
    user_id: str
    user_name: str
    user_email: str
    admin_id: Optional[str] = None
    admin_name: Optional[str] = None
    admin_email: Optional[str] = None


class ConversationCreate(ConversationBase):
    pass


class Conversation(ConversationBase):
    id: str
    created_at: datetime
    messages: List[Message] = []

    class Config:
        orm_mode = True
        from_attributes = True