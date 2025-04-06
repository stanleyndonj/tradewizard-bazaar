
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
import uuid
from datetime import datetime
from ..database import Base

class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    robot_id = Column(String(36), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), nullable=False)
    payment_method = Column(String(50), nullable=False)
    status = Column(String(20), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=True, onupdate=datetime.utcnow)
    # Additional fields for payment tracking
    mpesa_checkout_request_id = Column(String(50), nullable=True)
    card_payment_id = Column(String(50), nullable=True)
