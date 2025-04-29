
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import chat, user
from ..schemas import chat as chat_schema
from ..utils.auth import get_current_user

router = APIRouter(
    prefix="/api/chat",
    tags=["chat"],
    responses={404: {"description": "Not found"}},
)

@router.post("/conversations", response_model=chat_schema.ConversationResponse)
def create_conversation(
    conversation: chat_schema.ConversationCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Validate that the current user is creating their own conversation
    if current_user.id != conversation.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create conversation for another user"
        )
    
    # Create conversation
    db_conversation = chat.Conversation(
        title=conversation.title,
        user_id=conversation.user_id
    )
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    return db_conversation

@router.get("/conversations", response_model=List[chat_schema.ConversationResponse])
def get_conversations(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Get all conversations for the current user
    conversations = db.query(chat.Conversation).filter(
        chat.Conversation.user_id == current_user.id
    ).all()
    return conversations

@router.get("/conversations/{conversation_id}", response_model=chat_schema.ConversationResponse)
def get_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Get a specific conversation
    conversation = db.query(chat.Conversation).filter(
        chat.Conversation.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Verify the user has access to this conversation
    if conversation.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this conversation"
        )
    
    return conversation

@router.post("/messages", response_model=chat_schema.MessageResponse)
def create_message(
    message: chat_schema.MessageCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Validate conversation exists
    conversation = db.query(chat.Conversation).filter(
        chat.Conversation.id == message.conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Only the conversation owner or the sender can add messages
    if conversation.user_id != current_user.id and message.sender_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add messages to this conversation"
        )
    
    # Create message
    db_message = chat.Message(
        content=message.content,
        sender_id=message.sender_id,
        conversation_id=message.conversation_id,
        is_read=message.is_read
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@router.get("/conversations/{conversation_id}/messages", response_model=List[chat_schema.MessageResponse])
def get_messages(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Validate conversation exists
    conversation = db.query(chat.Conversation).filter(
        chat.Conversation.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Verify the user has access to this conversation
    if conversation.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view messages in this conversation"
        )
    
    # Get messages for the conversation
    messages = db.query(chat.Message).filter(
        chat.Message.conversation_id == conversation_id
    ).order_by(chat.Message.created_at).all()
    
    return messages

@router.put("/messages/{message_id}/read")
def mark_message_as_read(
    message_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Find the message
    message = db.query(chat.Message).filter(
        chat.Message.id == message_id
    ).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Verify the user has access to this message
    conversation = db.query(chat.Conversation).filter(
        chat.Conversation.id == message.conversation_id
    ).first()
    
    if conversation.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to mark this message as read"
        )
    
    # Update message
    message.is_read = True
    db.commit()
    
    return {"detail": "Message marked as read"}

@router.get("/messages/unread/count")
def get_unread_message_count(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Get conversations owned by the user
    conversations = db.query(chat.Conversation).filter(
        chat.Conversation.user_id == current_user.id
    ).all()
    
    # Get conversation IDs
    conversation_ids = [conversation.id for conversation in conversations]
    
    # Count unread messages
    unread_count = db.query(chat.Message).filter(
        chat.Message.conversation_id.in_(conversation_ids),
        chat.Message.is_read == False,
        chat.Message.sender_id != current_user.id
    ).count()
    
    return {"unread_count": unread_count}
