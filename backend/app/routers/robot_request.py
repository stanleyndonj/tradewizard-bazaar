from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid

from ..database import get_db
from ..models.robot_request import RobotRequest
from ..models.user import User
from ..models.notification import Notification # Added import for Notification model
from ..schemas.robot_request import RobotRequestCreate, RobotRequestResponse, RobotRequestUpdate, RobotRequestStatusUpdate # Added import for RobotRequestStatusUpdate
from ..utils.auth import get_user_from_token

router = APIRouter(prefix="/robot-requests", tags=["robot-requests"])

@router.post("", response_model=RobotRequestResponse)
async def create_robot_request(
    request: RobotRequestCreate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_user_from_token)
):
    """Create a new robot request"""
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    # Verify that the user exists
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Create the robot request with all fields
    new_request = RobotRequest(
        id=str(uuid.uuid4()),
        user_id=current_user_id,
        robot_type=request.robot_type,
        trading_pairs=request.trading_pairs,
        timeframe=request.timeframe,
        risk_level=request.risk_level,
        status="pending",
        is_delivered=False,
        progress=0,

        # New fields
        bot_name=request.bot_name,
        market=request.market,
        stake_amount=request.stake_amount,
        contract_type=request.contract_type,
        duration=request.duration,
        prediction=request.prediction,
        currency=request.currency,
        trading_strategy=request.trading_strategy,

        # MT5 specific fields
        account_credentials=request.account_credentials,
        volume=request.volume,
        order_type=request.order_type,
        stop_loss=request.stop_loss,
        take_profit=request.take_profit,
        entry_rules=request.entry_rules,
        exit_rules=request.exit_rules,
        risk_management=request.risk_management,
        additional_parameters=request.additional_parameters
    )

    # Update user's has_requested_robot status
    user.has_requested_robot = True

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    # Create notifications for admins
    user_name = user.name if user and user.name else user.email if user else "User"

    # Send notification to all admins
    admins = db.query(User).filter(User.is_admin == True).all()
    for admin in admins:
        notification = Notification(
            id=str(uuid.uuid4()),
            user_id=admin.id,
            type='robot_request',
            title=f"New robot request from {user_name}",
            content=f"Request type: {request.robot_type}\nDescription: {request.description[:50]}...", # Using request.description for better content
            related_id=new_request.id,
            is_read=False
        )
        db.add(notification)

    db.commit()

    return new_request

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

@router.get("/{request_id}", response_model=RobotRequestResponse)
async def get_robot_request(
    request_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_user_from_token)
):
    """Get a specific robot request"""
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    # Get the request
    request = db.query(RobotRequest).filter(RobotRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Robot request not found"
        )

    # Check if the user is the owner or an admin
    current_user = db.query(User).filter(User.id == current_user_id).first()
    if current_user_id != request.user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this request"
        )

    return request

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
            request.progress = 100

            # Update user's robots_delivered status
            user = db.query(User).filter(User.id == request.user_id).first()
            if user:
                user.robots_delivered = True

    if updates.download_url is not None:
        request.download_url = updates.download_url

    if updates.notes is not None:
        request.notes = updates.notes

    if updates.progress is not None:
        request.progress = updates.progress

    db.commit()
    db.refresh(request)

    # Create notification for the user about status change
    user = db.query(User).filter(User.id == request.user_id).first()
    if user:
        notification = Notification(
            id=str(uuid.uuid4()),
            user_id=user.id,
            type='robot_request_update',
            title=f"Robot request '{request.bot_name if request.bot_name else request.id}' updated",
            content=f"Status changed to: {request.status}" + (f"\nAdmin notes: {updates.notes}" if updates.notes else ""),
            related_id=request_id,
            is_read=False
        )
        db.add(notification)
        db.commit()


    return request