from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models.user import User
from ..models.robot_request import RobotRequest
from ..models.purchase import Purchase
from ..schemas.user import UserCreate, UserResponse, UserUpdate
from ..schemas.robot_request import RobotRequestResponse
from ..schemas.purchase import PurchaseResponse
from ..utils.auth import get_user_from_token, create_access_token
from ..utils.hash_password import hash_password

router = APIRouter(prefix="/users", tags=["users"])

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    # Check if the email is already registered
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create the user
    hashed_password = hash_password(user.password)
    new_user = User(email=user.email, name=user.name, password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/me", response_model=UserResponse)
async def get_current_user(current_user_id: str = Depends(get_user_from_token), db: Session = Depends(get_db)):
    """Get the current user"""
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.get("", response_model=List[UserResponse])
async def get_all_users(db: Session = Depends(get_db), current_user_id: str = Depends(get_user_from_token)):
    """Get all users (admin only)"""
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user or not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    users = db.query(User).all()
    return users

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, db: Session = Depends(get_db), current_user_id: str = Depends(get_user_from_token)):
    """Get a specific user by ID (admin only or self)"""
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if current_user_id != user_id and not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this user"
        )
    
    return target_user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_user_from_token)
):
    """Update a user (admin only or self)"""
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if current_user_id != user_id and not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user"
        )

    # Update fields
    if user_update.name is not None:
        target_user.name = user_update.name
    if user_update.email is not None:
        # Check if the new email is already registered
        existing_user = db.query(User).filter(User.email == user_update.email).first()
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        target_user.email = user_update.email
    if user_update.password is not None:
        target_user.password = hash_password(user_update.password)
    if user_update.role is not None and user.is_admin:
        target_user.role = user_update.role

    target_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(target_user)
    return target_user

@router.delete("/{user_id}")
async def delete_user(user_id: str, db: Session = Depends(get_db), current_user_id: str = Depends(get_user_from_token)):
    """Delete a user (admin only)"""
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user or not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db.delete(target_user)
    db.commit()
    return {"message": "User deleted successfully"}

# Fix the path to match what the frontend is expecting
@router.get("/{user_id}/robot-requests", response_model=List[RobotRequestResponse])
async def get_user_robot_requests(
    user_id: str,
    db: Session = Depends(get_db),
    current_user_id: Optional[str] = Depends(get_user_from_token)
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

# Fix the path to match what the frontend is expecting
@router.get("/{user_id}/purchases", response_model=List[PurchaseResponse])
async def get_user_purchases(
    user_id: str,
    db: Session = Depends(get_db),
    current_user_id: Optional[str] = Depends(get_user_from_token)
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
