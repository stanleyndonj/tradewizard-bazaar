from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class MessageBase(BaseModel):
    content: str
    sender_id: str
    is_read: bool = False

class MessageCreate(MessageBase):
    conversation_id: str

class MessageResponse(MessageBase):
    id: str
    conversation_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationBase(BaseModel):
    title: str
    user_id: str

class ConversationCreate(ConversationBase):
    pass

class ConversationResponse(ConversationBase):
    id: str
    created_at: datetime
    messages: Optional[List[MessageResponse]] = []

    class Config:
        from_attributes = True