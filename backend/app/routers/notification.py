
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from ..database import get_db
from ..models.user import User
from ..models.notification import Notification
from ..utils.auth import get_user_from_token
from ..schemas.notification import NotificationResponse, NotificationCreate

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

@router.get("", response_model=List[NotificationResponse])
async def get_user_notifications(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_user_from_token)
):
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user_id
    ).order_by(Notification.created_at.desc()).all()
    
    return notifications

@router.post("", response_model=NotificationResponse)
async def create_notification(
    notification_data: NotificationCreate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_user_from_token)
):
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can create notifications")
    
    notification = Notification(
        id=str(uuid.uuid4()),
        user_id=notification_data.user_id,
        type=notification_data.type,
        title=notification_data.title,
        content=notification_data.content,
        related_id=notification_data.related_id,
        is_read=False
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    return notification

@router.patch("/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_user_from_token)
):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if notification.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this notification")
    
    notification.is_read = True
    db.commit()
    
    return {"status": "success"}

@router.patch("/read-all")
async def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_user_from_token)
):
    db.query(Notification).filter(
        Notification.user_id == current_user_id,
        Notification.is_read == False
    ).update({"is_read": True})
    
    db.commit()
    
    return {"status": "success"}

@router.get("/unread-count")
async def get_unread_count(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_user_from_token)
):
    count = db.query(Notification).filter(
        Notification.user_id == current_user_id,
        Notification.is_read == False
    ).count()
    
    return {"unread_count": count}
