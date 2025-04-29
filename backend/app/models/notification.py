
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from uuid import uuid4

from ..database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, nullable=False)  # e.g., "robot_request", "message", "system"
    is_read = Column(Boolean, default=False)
    related_id = Column(String, nullable=True)  # Optional ID for related entity (conversation, robot, etc.)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
