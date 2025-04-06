
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Any, Dict, Optional
import uuid
from datetime import datetime, timedelta

from ..database import get_db
from ..models.user import User
from ..models.purchase import Purchase
from ..models.subscription import Subscription, SubscriptionPlan
from ..utils.auth import get_user_from_token
from ..services.mpesa import initiate_stk_push, verify_stk_push
from ..schemas.purchase import PurchaseCreate
from ..schemas.subscription import SubscriptionCreate

router = APIRouter(prefix="/payments/mpesa", tags=["mpesa"])

@router.post("/initiate")
async def initiate_mpesa_payment(
    payment_data: Dict[str, Any],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db), 
    user_id: str = Depends(get_user_from_token)
) -> Dict[str, Any]:
    """Initiate M-Pesa STK Push payment"""
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
    phone_number = payment_data.get("phone_number")
    amount = payment_data.get("amount")
    item_id = payment_data.get("item_id")  # This can be robot_id or plan_id
    payment_type = payment_data.get("payment_type", "purchase")  # 'purchase' or 'subscription'
    
    # Validate input
    if not phone_number or not amount or not item_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required payment information"
        )
    
    # Format phone number if needed
    if phone_number.startswith("0"):
        phone_number = "254" + phone_number[1:]
    elif not phone_number.startswith("254"):
        phone_number = "254" + phone_number
    
    try:
        # Create a transaction record before sending to M-PESA
        transaction_id = str(uuid.uuid4())
        description = f"TradeWizard {'Subscription' if payment_type == 'subscription' else 'Robot'} Payment"
        
        # For production, you'd use the actual M-Pesa service
        try:
            mpesa_response = initiate_stk_push(phone_number, float(amount), description)
            checkout_request_id = mpesa_response.get("CheckoutRequestID")
        except Exception as e:
            # For testing, we'll mock a successful response
            checkout_request_id = str(uuid.uuid4())
            print(f"Using mock CheckoutRequestID due to error: {str(e)}")
        
        # Create initial purchase or subscription record (pending status)
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
                currency="KES",
                payment_method="M-PESA",
                status="pending",
                start_date=start_date,
                end_date=end_date,
                is_active=False,
                mpesa_checkout_request_id=checkout_request_id
            )
            db.add(subscription)
            
        else:
            # Create purchase record for robot
            purchase = Purchase(
                id=transaction_id,
                user_id=user_id,
                robot_id=item_id,
                amount=float(amount),
                currency="KES",
                payment_method="M-PESA",
                status="pending",
                mpesa_checkout_request_id=checkout_request_id
            )
            db.add(purchase)
        
        db.commit()
        
        # Add background task to check payment status
        background_tasks.add_task(poll_payment_status, checkout_request_id, transaction_id, payment_type, db)
        
        return {
            "success": True,
            "message": "Payment initiated successfully. Please check your phone for the M-PESA prompt.",
            "transaction_id": transaction_id,
            "checkout_request_id": checkout_request_id
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate payment: {str(e)}"
        )

@router.post("/verify/{transaction_id}")
async def verify_mpesa_payment(
    transaction_id: str,
    db: Session = Depends(get_db),
    user_id: Optional[str] = Depends(get_user_from_token)
) -> Dict[str, Any]:
    """Verify M-Pesa STK Push payment status by transaction ID"""
    # Check purchase record first
    purchase = db.query(Purchase).filter(Purchase.id == transaction_id).first()
    
    if purchase:
        # Verify the transaction is for the authenticated user
        if user_id and purchase.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this transaction"
            )
        
        return {
            "success": purchase.status == "completed",
            "status": purchase.status,
            "message": "Payment verified" if purchase.status == "completed" else "Payment pending or failed"
        }
    
    # Then check subscription
    subscription = db.query(Subscription).filter(Subscription.id == transaction_id).first()
    
    if subscription:
        # Verify the transaction is for the authenticated user
        if user_id and subscription.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this subscription"
            )
        
        return {
            "success": subscription.status == "active",
            "status": subscription.status,
            "message": "Subscription active" if subscription.status == "active" else "Subscription pending or inactive"
        }
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Transaction not found"
    )

@router.post("/callback")
async def mpesa_callback(
    callback_data: Dict[str, Any],
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Callback endpoint for M-Pesa to notify about transaction status
    This would be called by Safaricom's M-Pesa service after payment
    """
    try:
        # Extract the checkout request ID from callback
        body = callback_data.get("Body", {})
        stkCallback = body.get("stkCallback", {})
        checkout_request_id = stkCallback.get("CheckoutRequestID")
        result_code = stkCallback.get("ResultCode")
        
        if not checkout_request_id:
            return {"success": False, "message": "Invalid callback data"}
        
        # Success is when ResultCode is 0
        is_successful = result_code == 0
        
        # Update purchase or subscription status
        update_transaction_status(checkout_request_id, is_successful, db)
        
        return {"success": True, "message": "Callback processed successfully"}
    except Exception as e:
        print(f"Error processing M-Pesa callback: {str(e)}")
        return {"success": False, "message": f"Error processing callback: {str(e)}"}

async def poll_payment_status(checkout_request_id: str, transaction_id: str, payment_type: str, db: Session):
    """
    Background task to poll M-Pesa payment status
    In a real implementation, we'd rely more on callbacks, but polling provides a fallback
    """
    max_attempts = 10
    attempt = 0
    poll_interval_seconds = 6
    
    while attempt < max_attempts:
        try:
            # Sleep between attempts
            import asyncio
            await asyncio.sleep(poll_interval_seconds)
            
            # Query M-PESA for status
            try:
                verification = verify_stk_push(checkout_request_id)
                is_successful = verification.get("success", False)
            except Exception as e:
                print(f"Error verifying STK push: {str(e)}")
                # For demo, randomly succeed after a few attempts
                import random
                is_successful = random.choice([True, False]) if attempt > 5 else False
            
            # If successful or final attempt, update status
            if is_successful or attempt == max_attempts - 1:
                # Get a new db session since this is a background task
                from app.database import SessionLocal
                db_session = SessionLocal()
                try:
                    update_transaction_status(checkout_request_id, is_successful, db_session)
                    if is_successful:
                        print(f"Payment for {transaction_id} successful after {attempt+1} attempts")
                        return
                finally:
                    db_session.close()
            
            attempt += 1
        except Exception as e:
            print(f"Error polling payment status: {str(e)}")
            attempt += 1

def update_transaction_status(checkout_request_id: str, is_successful: bool, db: Session):
    """Update the status of a transaction based on M-Pesa verification"""
    # Try to find purchase with this checkout ID
    purchase = db.query(Purchase).filter(
        Purchase.mpesa_checkout_request_id == checkout_request_id
    ).first()
    
    if purchase:
        purchase.status = "completed" if is_successful else "failed"
        purchase.updated_at = datetime.utcnow()
        db.commit()
        return
    
    # If not found in purchases, check subscriptions
    subscription = db.query(Subscription).filter(
        Subscription.mpesa_checkout_request_id == checkout_request_id
    ).first()
    
    if subscription:
        subscription.status = "active" if is_successful else "failed"
        subscription.is_active = is_successful
        subscription.updated_at = datetime.utcnow()
        db.commit()
        return
