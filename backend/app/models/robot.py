
from sqlalchemy import Column, String, Float, DateTime, ARRAY, Text
from sqlalchemy.sql import func
import uuid
from ..database import Base

class Robot(Base):
    __tablename__ = "robots"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    type = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    category = Column(String, nullable=False)
    features = Column(ARRAY(String), nullable=False)
    image_url = Column(String, nullable=True)
    imageUrl = Column(String, nullable=True)  # Added to match frontend requirement
    download_url = Column(String, nullable=True)  # Added for robot download functionality
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

