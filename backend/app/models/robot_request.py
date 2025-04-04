
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
    risk_level = Column(String, nullable=False)  # Changed from Integer to String to match frontend
    status = Column(String, default="pending")  # pending, in_progress, approved, rejected, delivered
    is_delivered = Column(Boolean, default=False)
    delivery_date = Column(DateTime(timezone=True), nullable=True)
    download_url = Column(String, nullable=True)  # URL for downloading the robot
    notes = Column(String, nullable=True)  # Admin notes about the request
    progress = Column(Integer, default=0)  # Progress percentage (0-100)
    currency = Column(String, nullable=True)  # Added currency field
    
    # New fields for detailed robot configuration
    bot_name = Column(String, nullable=True)
    market = Column(String, nullable=True)
    stake_amount = Column(String, nullable=True)  # Changed from Float to String to match frontend
    contract_type = Column(String, nullable=True)
    duration = Column(String, nullable=True)
    prediction = Column(String, nullable=True)
    trading_strategy = Column(String, nullable=True)
    
    # MT5 specific fields
    account_credentials = Column(String, nullable=True)
    volume = Column(String, nullable=True)  # Changed from Float to String to match frontend
    order_type = Column(String, nullable=True)
    stop_loss = Column(String, nullable=True)  # Changed from Float to String to match frontend
    take_profit = Column(String, nullable=True)  # Changed from Float to String to match frontend
    entry_rules = Column(String, nullable=True)
    exit_rules = Column(String, nullable=True)
    risk_management = Column(String, nullable=True)
    additional_parameters = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

