from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base
import datetime


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    user_name = Column(String, index=True)
    user_email = Column(String, index=True)
    admin_id = Column(String, index=True)
    admin_name = Column(String, index=True)
    admin_email = Column(String, index=True)
