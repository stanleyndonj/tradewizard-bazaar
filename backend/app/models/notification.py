
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..database import Base
import datetime

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True)
    type = Column(String)  # message, system, alert, etc
    title = Column(String)
    content = Column(Text)
    user_id = Column(String, index=True)
    is_read = Column(Boolean, default=False)
    related_id = Column(String, nullable=True)  # Optional ID related to notification (message_id, purchase_id, etc)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
