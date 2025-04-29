
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
import uuid
from datetime import datetime

from ..database import get_db
from ..models.chat import Conversation, Message
from ..schemas import Conversation as ConversationSchema, ConversationCreate, Message as MessageSchema, MessageCreate
from ..utils.auth import get_current_user

router = APIRouter(
    prefix="/api/chat",
    tags=["chat"],
)

@router.get("/conversations", response_model=List[ConversationSchema])
async def get_conversations(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.is_admin:
        # Admins can see all conversations
        conversations = db.query(Conversation).all()
    else:
        # Regular users can only see their conversations
        conversations = db.query(Conversation).filter(Conversation.user_id == current_user.id).all()
    
    return conversations

@router.post("/conversations", status_code=status.HTTP_201_CREATED, response_model=ConversationSchema)
async def create_conversation(
    user_id: Optional[str] = Query(None),
    user_name: Optional[str] = Query(None),
    user_email: Optional[str] = Query(None),
    admin_id: Optional[str] = Query(None),
    admin_name: Optional[str] = Query(None),
    admin_email: Optional[str] = Query(None),
    title: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # If user_id is not provided, use the current user's ID
    if not user_id:
        user_id = current_user.id
    
    # Create a new conversation
    conversation = Conversation(
        id=str(uuid.uuid4()),
        user_id=user_id,
        admin_id=admin_id if admin_id else (current_user.id if current_user.is_admin else None),
        title=title or f"Conversation {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    )
    
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    
    return conversation

@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageSchema])
async def get_messages(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Fetch the conversation to check access permissions
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Check if the user has access to this conversation
    if not current_user.is_admin and conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this conversation")
    
    # Fetch messages for the conversation
    messages = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at).all()
    
    return messages

@router.post("/conversations/{conversation_id}/messages", status_code=status.HTTP_201_CREATED, response_model=MessageSchema)
async def create_message(
    conversation_id: str,
    message: MessageCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Fetch the conversation to check access permissions
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Check if the user has access to this conversation
    if not current_user.is_admin and conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this conversation")
    
    # Create a new message
    new_message = Message(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        sender_id=current_user.id,
        content=message.content,
        is_read=message.is_read
    )
    
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    return new_message

@router.patch("/messages/{message_id}/read", status_code=status.HTTP_200_OK)
async def mark_message_as_read(
    message_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Check if the user has access to this message
    conversation = db.query(Conversation).filter(Conversation.id == message.conversation_id).first()
    if not current_user.is_admin and conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this message")
    
    message.is_read = True
    db.commit()
    
    return {"detail": "Message marked as read"}

@router.get("/unread-count", response_model=dict)
async def get_unread_message_count(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.is_admin:
        # For admins, count all unread messages
        count = db.query(Message).filter(Message.is_read == False).count()
    else:
        # For regular users, count unread messages in their conversations
        conversations = db.query(Conversation).filter(Conversation.user_id == current_user.id).all()
        conversation_ids = [conversation.id for conversation in conversations]
        count = db.query(Message).filter(
            Message.conversation_id.in_(conversation_ids),
            Message.is_read == False,
            Message.sender_id != current_user.id  # Don't count user's own messages
        ).count()
    
    return {"count": count}
