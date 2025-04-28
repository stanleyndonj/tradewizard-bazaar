
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
import uuid
from ..main import sio


router = APIRouter(
    prefix="/api/chat",
    tags=["chat"],
)


@router.get("/conversations", response_model=List[schemas.Conversation])
def get_conversations(db: Session = Depends(get_db)):
    conversations = db.query(models.Conversation).all()
    return conversations


@router.post("/conversations", response_model=schemas.Conversation)
def create_conversation(user_id:str, user_name: str, user_email: str, admin_id: str, admin_name: str, admin_email: str, db: Session = Depends(get_db)):
    new_conversation = models.Conversation(id=str(uuid.uuid4()), user_id=user_id, user_name=user_name, user_email=user_email, admin_id=admin_id, admin_name=admin_name, admin_email=admin_email)
    db.add(new_conversation)
    db.commit()
    db.refresh(new_conversation)
    return conversation
