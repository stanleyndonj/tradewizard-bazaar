
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from ..database import get_db
from ..models.robot_request import RobotRequest
from ..models.user import User
from ..schemas.robot_request import RobotRequestCreate, RobotRequestResponse
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
        status="pending"
    )
    
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
