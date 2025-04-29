from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from ..database import Base

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plan_id = Column(String(36), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), nullable=False)
    payment_method = Column(String(50), nullable=False)
    status = Column(String(20), nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    end_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=True, onupdate=datetime.utcnow)
    is_active = Column(Boolean, nullable=False, default=False)
    mpesa_checkout_request_id = Column(String(50), nullable=True)
    card_payment_id = Column(String(50), nullable=True)
    
    # Relationship
    user = relationship("User", back_populates="subscriptions")
    
class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    currency = Column(String(3), nullable=False, default="USD")
    interval = Column(String(20), nullable=False)  # monthly, yearly, etc.
    features = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=True, onupdate=datetime.utcnow)
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
