
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
import uuid
from ..database import Base

class RobotRequest(Base):
    __tablename__ = "robot_requests"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    robot_type = Column(String, nullable=False)
    trading_pairs = Column(String, nullable=False)
    timeframe = Column(String, nullable=False)
    risk_level = Column(Integer, nullable=False)
    status = Column(String, default="pending")  # pending, approved, rejected
    is_delivered = Column(Boolean, default=False)
    delivery_date = Column(DateTime(timezone=True), nullable=True)
    download_url = Column(String, nullable=True)  # URL for downloading the robot
    notes = Column(String, nullable=True)  # Admin notes about the request
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
