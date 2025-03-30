
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid

from ..database import get_db
from ..models.robot_request import RobotRequest
from ..models.user import User
from ..schemas.robot_request import RobotRequestCreate, RobotRequestResponse, RobotRequestUpdate
from ..utils.auth import get_user_from_token

router = APIRouter(prefix="/robot-requests", tags=["robot-requests"])

@router.post("", response_model=RobotRequestResponse)
async def create_robot_request(
    request: RobotRequestCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_from_token)
):
    """Create a new robot request"""
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
    
    # Create the robot request
    new_request = RobotRequest(
        id=str(uuid.uuid4()),
        user_id=user_id,
        robot_type=request.robot_type,
        trading_pairs=request.trading_pairs,
        timeframe=request.timeframe,
        risk_level=request.risk_level,
        status="pending",
        is_delivered=False
    )
    
    # Update user's has_requested_robot status
    user.has_requested_robot = True
    
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    
    return new_request

@router.get("/users/{user_id}", response_model=List[RobotRequestResponse])
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

@router.get("", response_model=List[RobotRequestResponse])
async def get_all_robot_requests(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_user_from_token)
):
    """Get all robot requests (admin only)"""
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Check if the user is an admin
    current_user = db.query(User).filter(User.id == current_user_id).first()
    if not current_user or not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Get all requests
    requests = db.query(RobotRequest).all()
    return requests

@router.patch("/{request_id}", response_model=RobotRequestResponse)
async def update_robot_request(
    request_id: str,
    updates: RobotRequestUpdate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_user_from_token)
):
    """Update a robot request (admin only)"""
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Check if the user is an admin
    current_user = db.query(User).filter(User.id == current_user_id).first()
    if not current_user or not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Get the request
    request = db.query(RobotRequest).filter(RobotRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Robot request not found"
        )
    
    # Update request fields
    if updates.status is not None:
        request.status = updates.status
    
    if updates.is_delivered is not None:
        request.is_delivered = updates.is_delivered
        if updates.is_delivered:
            request.delivery_date = datetime.now()
            
            # Update user's robots_delivered status
            user = db.query(User).filter(User.id == request.user_id).first()
            if user:
                user.robots_delivered = True
    
    if updates.download_url is not None:
        request.download_url = updates.download_url
        
    if updates.notes is not None:
        request.notes = updates.notes
    
    db.commit()
    db.refresh(request)
    
    return request
