
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import notification
from ..schemas import notification as notification_schema
from ..utils.auth import get_current_user

router = APIRouter(
    prefix="/api/notifications",
    tags=["notifications"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=notification_schema.NotificationResponse)
def create_notification(
    notification_data: notification_schema.NotificationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Only allow admins to create notifications for other users
    if notification_data.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create notifications for other users"
        )
    
    # Create notification
    db_notification = notification.Notification(
        user_id=notification_data.user_id,
        title=notification_data.title,
        content=notification_data.content,
        is_read=notification_data.is_read,
        notification_type=notification_data.notification_type
    )
    
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

@router.get("/", response_model=List[notification_schema.NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Get notifications for the current user
    notifications = db.query(notification.Notification).filter(
        notification.Notification.user_id == current_user.id
    ).order_by(notification.Notification.created_at.desc()).all()
    
    return notifications

@router.get("/unread/count")
def get_unread_notification_count(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Count unread notifications
    unread_count = db.query(notification.Notification).filter(
        notification.Notification.user_id == current_user.id,
        notification.Notification.is_read == False
    ).count()
    
    return {"unread_count": unread_count}

@router.put("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Find the notification
    db_notification = db.query(notification.Notification).filter(
        notification.Notification.id == notification_id
    ).first()
    
    if not db_notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    # Verify the user has access to this notification
    if db_notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to mark this notification as read"
        )
    
    # Update notification
    db_notification.is_read = True
    db.commit()
    
    return {"detail": "Notification marked as read"}

@router.put("/read/all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Update all notifications for this user
    db.query(notification.Notification).filter(
        notification.Notification.user_id == current_user.id,
        notification.Notification.is_read == False
    ).update({"is_read": True})
    
    db.commit()
    
    return {"detail": "All notifications marked as read"}
