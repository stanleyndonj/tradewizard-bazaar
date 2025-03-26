
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from ..database import get_db
from ..models.purchase import Purchase
from ..models.user import User
from ..models.robot import Robot
from ..schemas.purchase import PurchaseCreate, PurchaseResponse
from ..utils.auth import get_user_from_token

router = APIRouter(prefix="/purchases", tags=["purchases"])

@router.post("", response_model=PurchaseResponse)
async def create_purchase(
    purchase: PurchaseCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_from_token)
):
    """Create a new purchase"""
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Verify that the user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify that the robot exists
    robot = db.query(Robot).filter(Robot.id == purchase.robot_id).first()
    if not robot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Robot not found"
        )
    
    # Create the purchase
    new_purchase = Purchase(
        id=str(uuid.uuid4()),
        user_id=user_id,
        robot_id=purchase.robot_id,
        amount=purchase.amount,
        currency=purchase.currency,
        payment_method=purchase.payment_method,
        status="pending"  # Initial status
    )
    
    db.add(new_purchase)
    db.commit()
    db.refresh(new_purchase)
    
    return new_purchase

@router.get("/users/{user_id}", response_model=List[PurchaseResponse])
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
