
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
import uuid
from datetime import datetime, timedelta

from ..database import get_db
from ..models.user import User
from ..models.purchase import Purchase
from ..models.subscription import Subscription, SubscriptionPlan
from ..utils.auth import get_user_from_token
from ..services.card_payment import process_card_payment, verify_card_payment

router = APIRouter(prefix="/payments/card", tags=["card_payment"])

@router.post("/process")
async def process_payment(
    payment_data: Dict[str, Any],
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_from_token)
):
    """Process a card payment"""
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Get the user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Extract payment details
    card_details = payment_data.get("card_details")
    amount = payment_data.get("amount")
    currency = payment_data.get("currency", "USD")
    item_id = payment_data.get("item_id")  # This can be robot_id or plan_id
    payment_type = payment_data.get("payment_type", "purchase")  # 'purchase' or 'subscription'
    
    # Validate input
    if not card_details or not amount or not item_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required payment information"
        )
    
    try:
        # Create a transaction record
        transaction_id = str(uuid.uuid4())
        description = f"TradeWizard {'Subscription' if payment_type == 'subscription' else 'Robot'} Payment"
        
        # Process the payment
        payment_result = process_card_payment(card_details, float(amount), currency, description)
        
        if not payment_result.get("success"):
            return {
                "success": False,
                "message": payment_result.get("message", "Payment processing failed"),
                "transaction_id": transaction_id
            }
        
        payment_id = payment_result.get("payment_id")
        status_value = "completed" if payment_result.get("status") == "succeeded" else "pending"
        
        # Create record based on payment type
        if payment_type == "subscription":
            # Get subscription plan details
            plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == item_id).first()
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
            
            # Create new subscription record
            subscription = Subscription(
                id=transaction_id,
                user_id=user_id,
                plan_id=item_id,
                amount=float(amount),
                currency=currency,
                payment_method="Card",
                status=status_value,
                start_date=start_date,
                end_date=end_date,
                is_active=status_value == "completed",
                card_payment_id=payment_id
            )
            db.add(subscription)
            
        else:
            # Create purchase record for robot
            purchase = Purchase(
                id=transaction_id,
                user_id=user_id,
                robot_id=item_id,
                amount=float(amount),
                currency=currency,
                payment_method="Card",
                status=status_value,
                card_payment_id=payment_id
            )
            db.add(purchase)
        
        db.commit()
        
        return {
            "success": True,
            "message": "Payment processed successfully",
            "transaction_id": transaction_id,
            "payment_id": payment_id,
            "status": status_value
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process payment: {str(e)}"
        )

@router.post("/verify/{payment_id}")
async def verify_payment(
    payment_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_from_token)
):
    """Verify a card payment status"""
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    try:
        # Check payment status with payment provider
        verification = verify_card_payment(payment_id)
        
        if verification.get("success"):
            # Update purchase or subscription status if needed
            # Find purchase with this payment ID
            purchase = db.query(Purchase).filter(
                Purchase.card_payment_id == payment_id,
                Purchase.status != "completed"
            ).first()
            
            if purchase:
                purchase.status = "completed"
                purchase.updated_at = datetime.utcnow()
                db.commit()
                return {
                    "success": True,
                    "status": "completed",
                    "message": "Payment verified successfully",
                    "transaction_type": "purchase",
                    "transaction_id": purchase.id
                }
            
            # If not found in purchases, check subscriptions
            subscription = db.query(Subscription).filter(
                Subscription.card_payment_id == payment_id,
                Subscription.status != "active"
            ).first()
            
            if subscription:
                subscription.status = "active"
                subscription.is_active = True
                subscription.updated_at = datetime.utcnow()
                db.commit()
                return {
                    "success": True,
                    "status": "active",
                    "message": "Subscription activated successfully",
                    "transaction_type": "subscription",
                    "transaction_id": subscription.id
                }
            
            # Payment verified but no matching records found
            return {
                "success": True,
                "status": "verified",
                "message": "Payment verified, but no pending transactions found"
            }
        
        return {
            "success": False,
            "message": "Payment verification failed",
            "status": verification.get("status", "unknown")
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify payment: {str(e)}"
        )
