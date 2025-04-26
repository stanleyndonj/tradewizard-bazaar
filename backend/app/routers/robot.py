from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import os
import shutil
from pathlib import Path

from ..database import get_db
from ..models.robot import Robot
from ..models.user import User
from ..schemas.robot import RobotCreate, RobotResponse, RobotUpdate
from ..utils.auth import get_user_from_token

router = APIRouter(prefix="/robots", tags=["robots"])

# Ensure uploads directory exists
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.get("", response_model=List[RobotResponse])
async def get_robots(db: Session = Depends(get_db)):
    """Get all robots"""
    robots = db.query(Robot).all()
    return robots

@router.get("/{robot_id}", response_model=RobotResponse)
async def get_robot(robot_id: str, db: Session = Depends(get_db)):
    """Get a specific robot by ID"""
    robot = db.query(Robot).filter(Robot.id == robot_id).first()
    if not robot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Robot not found"
        )
    return robot

@router.post("", response_model=RobotResponse)
async def create_robot(
    data: RobotCreate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_user_from_token)
):
    """Create a new robot (admin only)"""
    # Get the current user
    current_user = db.query(User).filter(User.id == current_user_id).first()
    if not current_user or not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )

    # Create the robot
    robot = Robot(
        id=str(uuid.uuid4()),
        name=data.name,
        description=data.description,
        price=data.price,
        category=data.category,
        features=data.features,
        is_featured=data.is_featured,
        image_url=data.image_url
    )

    db.add(robot)
    db.commit()
    db.refresh(robot)

    # Create notifications for all users
    from ..models.notification import Notification
    from ..models.user import User

    # Get all users (non-admin)
    users = db.query(User).filter(User.is_admin == False).all()

    for user in users:
        notification = Notification(
            id=str(uuid.uuid4()),
            user_id=user.id,
            type='new_robot',
            title=f"New robot available: {data.name}",
            content=f"A new trading robot has been added to the marketplace: {data.description[:50]}...",
            related_id=robot.id,
            is_read=False
        )
        db.add(notification)

    db.commit()

    return robot

@router.put("/{robot_id}", response_model=RobotResponse)
async def update_robot(
    robot_id: str,
    robot: RobotUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_from_token)
):
    """Update a robot (admin only)"""
    # Check if user is admin
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update robots"
        )

    # Get the robot
    db_robot = db.query(Robot).filter(Robot.id == robot_id).first()
    if not db_robot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Robot not found"
        )

    # Update fields
    for key, value in robot.dict(exclude_unset=True).items():
        setattr(db_robot, key, value)

    db.commit()
    db.refresh(db_robot)

    return db_robot

@router.delete("/{robot_id}")
async def delete_robot(
    robot_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_from_token)
):
    """Delete a robot (admin only)"""
    # Check if user is admin
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete robots"
        )

    # Get the robot
    db_robot = db.query(Robot).filter(Robot.id == robot_id).first()
    if not db_robot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Robot not found"
        )

    db.delete(db_robot)
    db.commit()

    return {"message": "Robot deleted successfully"}

@router.post("/{robot_id}/upload")
async def upload_robot_file(
    robot_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_from_token)
):
    """Upload a robot file (admin only)"""
    # Check if user is admin
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to upload robot files"
        )

    # Get the robot
    db_robot = db.query(Robot).filter(Robot.id == robot_id).first()
    if not db_robot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Robot not found"
        )

    # Check file extension
    file_extension = file.filename.split('.')[-1].lower()
    if file_extension not in ['zip', 'xml']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only ZIP and XML files are allowed"
        )

    # Create a unique filename
    unique_filename = f"{robot_id}_{file.filename}"
    file_path = UPLOAD_DIR / unique_filename

    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Update robot with download URL
    download_url = f"/uploads/{unique_filename}"
    db_robot.download_url = download_url
    db.commit()

    return {
        "filename": file.filename,
        "download_url": download_url
    }