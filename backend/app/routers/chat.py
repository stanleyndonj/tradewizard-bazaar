
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from ..database import get_db
from ..models.user import User
from ..models.chat import Conversation, ChatMessage
from ..utils.auth import get_user_from_token
from ..schemas.chat import ConversationResponse, ChatMessageResponse, ConversationCreate, ChatMessageCreate

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_user_from_token)
):
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # For admin, return all conversations
    if user.is_admin:
        conversations = db.query(Conversation).order_by(Conversation.last_message_time.desc()).all()
    else:
        # For regular users, return only their conversations
        conversations = db.query(Conversation).filter(Conversation.user_id == current_user_id).order_by(Conversation.last_message_time.desc()).all()
    
    return conversations

@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(
    conversation_data: ConversationCreate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_user_from_token)
):
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if a conversation already exists for this user
    existing = db.query(Conversation).filter(Conversation.user_id == conversation_data.user_id).first()
    if existing:
        return existing
    
    conversation = Conversation(
        id=str(uuid.uuid4()),
        user_id=conversation_data.user_id,
        user_name=conversation_data.user_name,
        user_email=conversation_data.user_email,
        last_message="Conversation started",
    )
    
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    
    # Add initial welcome message
    welcome_message = ChatMessage(
        id=str(uuid.uuid4()),
        conversation_id=conversation.id,
        sender="admin",
        sender_id="system",
        text="Welcome to TradeWizard support! How can we help you today?",
        read=False
    )
    
    db.add(welcome_message)
    db.commit()
    
    return conversation

@router.get("/conversations/{conversation_id}/messages", response_model=List[ChatMessageResponse])
async def get_messages(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_user_from_token)
):
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Security check: only admin or conversation owner can get messages
    if not user.is_admin and conversation.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view these messages")
    
    messages = db.query(ChatMessage).filter(ChatMessage.conversation_id == conversation_id).order_by(ChatMessage.timestamp.asc()).all()
    return messages

@router.post("/conversations/{conversation_id}/messages", response_model=ChatMessageResponse)
async def send_message(
    conversation_id: str,
    message_data: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_user_from_token)
):
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Security check: only admin or conversation owner can send messages
    if not user.is_admin and conversation.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to send messages in this conversation")
    
    # Determine sender type
    sender_type = "admin" if user.is_admin else "user"
    
    message = ChatMessage(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        sender=sender_type,
        sender_id=current_user_id,
        text=message_data.text,
        read=False
    )
    
    db.add(message)
    
    # Update conversation's last message
    conversation.last_message = message_data.text
    conversation.last_message_time = message.timestamp
    
    db.commit()
    db.refresh(message)
    
    return message

@router.patch("/messages/{message_id}/read")
async def mark_message_as_read(
    message_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_user_from_token)
):
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    message = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Get the conversation for security check
    conversation = db.query(Conversation).filter(Conversation.id == message.conversation_id).first()
    
    # Security check: only admin or conversation owner can mark messages as read
    if not user.is_admin and conversation.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to mark messages in this conversation")
    
    # Only mark message as read if it wasn't sent by the current user
    if (user.is_admin and message.sender == "user") or (not user.is_admin and message.sender == "admin"):
        message.read = True
        db.commit()
    
    return {"status": "success"}

@router.get("/unread-count")
async def get_unread_count(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_user_from_token)
):
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_admin:
        # For admin, count unread messages from all users
        count = db.query(ChatMessage).filter(
            ChatMessage.sender == "user",
            ChatMessage.read == False
        ).count()
    else:
        # For regular users, count unread messages in their conversations
        conversations = db.query(Conversation).filter(Conversation.user_id == current_user_id).all()
        conv_ids = [conv.id for conv in conversations]
        
        count = db.query(ChatMessage).filter(
            ChatMessage.conversation_id.in_(conv_ids),
            ChatMessage.sender == "admin",
            ChatMessage.read == False
        ).count()
    
    return {"unread_count": count}
