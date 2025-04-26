
import uuid
from sqlalchemy import Column, String, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func

from ..database import Base

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, index=True, nullable=False)
    type = Column(String, nullable=False)  # 'message', 'robot_request', 'new_robot'
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    related_id = Column(String, nullable=True)  # ID of related entity (message, robot request, etc.)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
