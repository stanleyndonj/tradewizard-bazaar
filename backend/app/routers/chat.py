
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
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
def create_conversation(
    user_id: str, 
    user_name: str, 
    user_email: str, 
    admin_id: Optional[str] = None, 
    admin_name: Optional[str] = None, 
    admin_email: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    conversation_id = str(uuid.uuid4())
    new_conversation = models.Conversation(
        id=conversation_id, 
        user_id=user_id, 
        user_name=user_name, 
        user_email=user_email, 
        admin_id=admin_id, 
        admin_name=admin_name, 
        admin_email=admin_email
    )
    db.add(new_conversation)
    db.commit()
    db.refresh(new_conversation)
    
    # Notify connected clients about the new conversation
    async def notify_new_conversation():
        await sio.emit('new_conversation', {"conversation_id": conversation_id})
    
    # Run the async function
    import asyncio
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(notify_new_conversation())
        else:
            loop.run_until_complete(notify_new_conversation())
    except Exception as e:
        print(f"Error emitting socket event: {e}")
    
    return new_conversation


@router.get("/messages/{conversation_id}", response_model=List[schemas.Message])
def get_messages(conversation_id: str, db: Session = Depends(get_db)):
    messages = db.query(models.Message).filter(models.Message.conversation_id == conversation_id).all()
    return messages


@router.post("/messages/{conversation_id}", response_model=schemas.Message)
def send_message(
    conversation_id: str, 
    text: str, 
    sender: str, 
    sender_id: str, 
    db: Session = Depends(get_db)
):
    # Check if conversation exists
    conversation = db.query(models.Conversation).filter(models.Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    message_id = str(uuid.uuid4())
    new_message = models.Message(
        id=message_id,
        content=text,
        sender=sender,
        sender_id=sender_id,
        conversation_id=conversation_id,
        is_read=False
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    # Notify connected clients about the new message
    async def notify_new_message():
        await sio.emit('new_message', {
            "id": message_id,
            "content": text,
            "sender": sender,
            "sender_id": sender_id,
            "conversation_id": conversation_id,
            "is_read": False,
            "created_at": new_message.created_at.isoformat()
        })
    
    # Run the async function
    import asyncio
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(notify_new_message())
        else:
            loop.run_until_complete(notify_new_message())
    except Exception as e:
        print(f"Error emitting socket event: {e}")
    
    return new_message


@router.patch("/messages/{message_id}/read", response_model=dict)
def mark_message_read(message_id: str, db: Session = Depends(get_db)):
    message = db.query(models.Message).filter(models.Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    message.is_read = True
    db.commit()
    
    return {"success": True}


@router.get("/unread-count", response_model=int)
def get_unread_message_count(
    user_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Message).filter(models.Message.is_read == False)
    
    if user_id:
        # Get conversations where the user is either the user or the admin
        user_conversations = db.query(models.Conversation).filter(
            (models.Conversation.user_id == user_id) | 
            (models.Conversation.admin_id == user_id)
        ).all()
        
        if not user_conversations:
            return 0
            
        conversation_ids = [conv.id for conv in user_conversations]
        query = query.filter(models.Message.conversation_id.in_(conversation_ids))
        
        # Only count messages that weren't sent by this user
        query = query.filter(models.Message.sender_id != user_id)
    
    return query.count()
