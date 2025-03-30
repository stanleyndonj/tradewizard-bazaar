
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models.user import User
from ..models.robot_request import RobotRequest
from ..models.purchase import Purchase
from ..schemas.user import UserCreate, UserResponse, UserUpdate
from ..schemas.robot_request import RobotRequestResponse
from ..schemas.purchase import PurchaseResponse
from ..utils.auth import get_user_from_token, create_access_token

router = APIRouter(prefix="/users", tags=["users"])

# ... keep existing code (user endpoints)

@router.get("/{user_id}/robot-requests", response_model=List[RobotRequestResponse])
async def get_user_robot_requests(
    user_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_user_from_token)
):
    """Get all robot requests for a specific user"""
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Check if the user is requesting their own requests or is an admin
    current_user = db.query(User).filter(User.id == current_user_id).first()
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if current_user_id != user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view these requests"
        )
    
    # Get the requests
    requests = db.query(RobotRequest).filter(RobotRequest.user_id == user_id).all()
    return requests

@router.get("/{user_id}/purchases", response_model=List[PurchaseResponse])
async def get_user_purchases(
    user_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_user_from_token)
):
    """Get all purchases for a specific user"""
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Check if the user is requesting their own purchases or is an admin
    current_user = db.query(User).filter(User.id == current_user_id).first()
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if current_user_id != user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view these purchases"
        )
    
    # Get the purchases
    purchases = db.query(Purchase).filter(Purchase.user_id == user_id).all()
    return purchases
