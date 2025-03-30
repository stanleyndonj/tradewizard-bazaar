
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.sql import func
import uuid
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False)
    role = Column(String(50), default="user")  # Add role for better permission control
    has_requested_robot = Column(Boolean, default=False)  # Track if user has requested a robot
    robots_delivered = Column(Boolean, default=False)  # Track if robots have been delivered
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
