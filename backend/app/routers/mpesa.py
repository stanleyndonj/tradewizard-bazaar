
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, Dict
import uuid

from ..database import get_db
from ..models.user import User
from ..utils.auth import get_user_from_token
from ..services.mpesa import initiate_stk_push, verify_stk_push

router = APIRouter(prefix="/payments/mpesa", tags=["mpesa"])

@router.post("/initiate")
async def initiate_mpesa_payment(
    payment_data: Dict[str, Any],
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
    robot_id = payment_data.get("robot_id")
    
    # Validate input
    if not phone_number or not amount or not robot_id:
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
        # For testing, we'll mock a successful response
        # In production, you'd use the actual M-Pesa service
        # response = initiate_stk_push(phone_number, amount, "Robot Purchase")
        
        # Mock response for testing
        checkout_request_id = str(uuid.uuid4())
        
        return {
            "success": True,
            "message": "Payment initiated successfully. Please check your phone.",
            "checkoutRequestID": checkout_request_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate payment: {str(e)}"
        )

@router.post("/verify")
async def verify_mpesa_payment(
    verification_data: Dict[str, Any],
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_from_token)
) -> Dict[str, Any]:
    """Verify M-Pesa STK Push payment status"""
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    checkout_request_id = verification_data.get("checkout_request_id")
    if not checkout_request_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing checkout request ID"
        )
    
    try:
        # For testing, we'll mock a successful verification
        # In production, you'd use the actual M-Pesa service
        # is_successful = verify_stk_push(checkout_request_id)
        
        # Mock response for testing (always successful)
        is_successful = True
        
        return {
            "success": is_successful,
            "message": "Payment verified successfully" if is_successful else "Payment failed or pending"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify payment: {str(e)}"
        )
