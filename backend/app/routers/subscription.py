from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime, timedelta

from ..database import get_db
from ..models.user import User
from ..models.subscription import Subscription, SubscriptionPlan
from ..models.robot import Robot # Assuming a Robot model exists
from ..utils.auth import get_user_from_token, get_admin_user
from ..schemas.subscription import (
    SubscriptionPlanCreate, 
    SubscriptionPlanResponse, 
    SubscriptionPlanUpdate,
    SubscriptionCreate,
    SubscriptionResponse,
    SubscriptionUpdate
)
from ..schemas.robot_request import RobotRequestResponse # Import from correct schema
from ..schemas.robot import RobotResponse # Keep this if needed

# Fixed router prefix to match the API endpoints needed by frontend
router = APIRouter(prefix="/subscription", tags=["subscription"]) # Removed the "/api" prefix


# Subscription Plans Endpoints (Admin only)
@router.post("/plans", response_model=SubscriptionPlanResponse)
async def create_subscription_plan(
    plan: SubscriptionPlanCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    """Create a new subscription plan (admin only)"""
    new_plan = SubscriptionPlan(
        id=str(uuid.uuid4()),
        name=plan.name,
        description=plan.description,
        price=plan.price,
        currency=plan.currency,
        interval=plan.interval,
        features=plan.features
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    return new_plan

@router.get("/plans", response_model=List[SubscriptionPlanResponse])
async def get_subscription_plans(db: Session = Depends(get_db)):
    """Get all subscription plans (public)"""
    plans = db.query(SubscriptionPlan).all()
    return plans

@router.get("/plans/{plan_id}", response_model=SubscriptionPlanResponse)
async def get_subscription_plan(plan_id: str, db: Session = Depends(get_db)):
    """Get a specific subscription plan by ID (public)"""
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription plan not found"
        )
    return plan

@router.put("/plans/{plan_id}", response_model=SubscriptionPlanResponse)
async def update_subscription_plan(
    plan_id: str,
    plan_update: SubscriptionPlanUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    """Update a subscription plan (admin only)"""
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription plan not found"
        )

    # Update fields if provided
    update_data = plan_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(plan, key, value)

    db.commit()
    db.refresh(plan)
    return plan

@router.delete("/plans/{plan_id}")
async def delete_subscription_plan(
    plan_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    """Delete a subscription plan (admin only)"""
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription plan not found"
        )

    db.delete(plan)
    db.commit()
    return {"message": "Subscription plan deleted successfully"}

# User subscriptions endpoints
@router.post("/subscribe", response_model=SubscriptionResponse)
async def create_subscription(
    subscription: SubscriptionCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_from_token)
):
    """Create a new subscription for the authenticated user"""
    # Verify the plan exists
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == subscription.plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription plan not found"
        )

    # Calculate end date based on plan interval
    start_date = datetime.utcnow()
    end_date = None
    if plan.interval == "monthly":
        end_date = start_date + timedelta(days=30)
    elif plan.interval == "yearly":
        end_date = start_date + timedelta(days=365)

    # Check if user already has an active subscription for this plan
    existing_sub = db.query(Subscription).filter(
        Subscription.user_id == user_id,
        Subscription.plan_id == subscription.plan_id,
        Subscription.is_active == True
    ).first()

    if existing_sub:
        # Extend the existing subscription
        existing_sub.end_date = end_date if existing_sub.end_date else (datetime.utcnow() + timedelta(days=30))
        existing_sub.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_sub)
        return existing_sub

    # Create new subscription
    new_subscription = Subscription(
        id=str(uuid.uuid4()),
        user_id=user_id,
        plan_id=subscription.plan_id,
        amount=subscription.amount,
        currency=subscription.currency,
        payment_method=subscription.payment_method,
        status="pending",  # Will be updated after payment
        start_date=start_date,
        end_date=end_date,
        is_active=False  # Will be set to True after payment
    )

    db.add(new_subscription)
    db.commit()
    db.refresh(new_subscription)
    return new_subscription

@router.get("/user/subscriptions", response_model=List[SubscriptionResponse])
async def get_user_subscriptions(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_from_token)
):
    """Get all subscriptions for the authenticated user"""
    subscriptions = db.query(Subscription).filter(Subscription.user_id == user_id).all()
    return subscriptions

@router.get("/user/active", response_model=List[SubscriptionResponse])
async def get_active_subscriptions(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_from_token)
):
    """Get active subscriptions for the authenticated user"""
    active_subs = db.query(Subscription).filter(
        Subscription.user_id == user_id,
        Subscription.is_active == True,
        Subscription.end_date > datetime.utcnow()
    ).all()
    return active_subs

@router.get("/check/{plan_id}")
async def check_subscription(
    plan_id: str,
    db: Session = Depends(get_db),
    user_id: Optional[str] = Depends(get_user_from_token)
):
    """Check if the authenticated user has an active subscription for a specific plan"""
    if not user_id:
        return {"has_subscription": False}

    active_sub = db.query(Subscription).filter(
        Subscription.user_id == user_id,
        Subscription.plan_id == plan_id,
        Subscription.is_active == True,
        Subscription.end_date > datetime.utcnow()
    ).first()

    return {"has_subscription": active_sub is not None}

@router.put("/cancel/{subscription_id}")
async def cancel_subscription(
    subscription_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_from_token)
):
    """Cancel a subscription for the authenticated user"""
    subscription = db.query(Subscription).filter(
        Subscription.id == subscription_id,
        Subscription.user_id == user_id
    ).first()

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found or not owned by user"
        )

    subscription.is_active = False
    subscription.status = "cancelled"
    subscription.updated_at = datetime.utcnow()

    db.commit()

    return {"message": "Subscription cancelled successfully"}


# Robot Request Endpoints
@router.post("/robots", response_model=RobotResponse) # Example endpoint
async def create_robot_request(robot_request: RobotRequest, db: Session = Depends(get_db), user_id: str = Depends(get_user_from_token)):
    # Add logic to create a robot request associated with the user.  This requires additional model and schema definitions.
    pass # Placeholder - needs implementation

@router.get("/robots", response_model=List[RobotResponse]) # Example endpoint
async def get_user_robots(db: Session = Depends(get_db), user_id: str = Depends(get_user_from_token)):
    # Add logic to retrieve robots for the user.  This needs to consider the relationship between users and robots in the database.
    pass # Placeholder - needs implementation