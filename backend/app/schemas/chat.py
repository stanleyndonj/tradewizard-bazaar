<<<<<<< HEAD
from pydantic import BaseModel


class Conversation(BaseModel):
    id: str
    user_id: str
    user_name: str
    user_email: str
    admin_id: str
    admin_name: str
    admin_email: str
=======

from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class ConversationBase(BaseModel):
    user_id: str
    user_name: str
    user_email: EmailStr

class ConversationCreate(ConversationBase):
    pass

class ConversationResponse(ConversationBase):
    id: str
    last_message: Optional[str] = None
    last_message_time: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

class ChatMessageBase(BaseModel):
    text: str

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageResponse(ChatMessageBase):
    id: str
    conversation_id: str
    sender: str
    sender_id: str
    text: str
    read: bool
    timestamp: datetime
    
    class Config:
        from_attributes = True
>>>>>>> 81304081b7ff876300be50827e29718378aa233f
