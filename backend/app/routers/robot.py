
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from ..database import get_db
from ..models.robot import Robot
from ..models.user import User  # Added missing import
from ..schemas.robot import RobotCreate, RobotResponse
from ..utils.auth import get_user_from_token

router = APIRouter(prefix="/robots", tags=["robots"])

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
    robot: RobotCreate, 
    db: Session = Depends(get_db), 
    user_id: str = Depends(get_user_from_token)
):
    """Create a new robot (admin only)"""
    # Check if user is admin (you'd need to implement this check)
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create robots"
        )
    
    # Create the robot
    new_robot = Robot(
        id=str(uuid.uuid4()),
        name=robot.name,
        description=robot.description,
        type=robot.type,
        price=robot.price,
        currency=robot.currency,
        category=robot.category,
        features=robot.features,
        image_url=robot.image_url
    )
    
    db.add(new_robot)
    db.commit()
    db.refresh(new_robot)
    
    return new_robot
