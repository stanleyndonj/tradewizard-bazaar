
from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from ..database import Base
import datetime

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=True)
    user_id = Column(String, index=True)
    user_name = Column(String)
    user_email = Column(String)
    admin_id = Column(String, nullable=True)
    admin_name = Column(String, nullable=True)
    admin_email = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationship to messages
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, index=True)
    content = Column(Text)
    sender = Column(String)  # Name of the sender
    sender_id = Column(String, index=True)  # ID of the sender
    is_read = Column(Boolean, default=False)
    conversation_id = Column(String, ForeignKey("conversations.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationship to conversation
    conversation = relationship("Conversation", back_populates="messages")
