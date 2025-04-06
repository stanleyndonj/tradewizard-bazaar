
import requests
import base64
import datetime
from app.config import settings
import json

def generate_access_token():
    """
    Generates an OAuth access token for M-Pesa API calls.
    
    Returns:
        str: The access token string.
    """
    consumer_key = settings.M_PESA_CONSUMER_KEY
    consumer_secret = settings.M_PESA_CONSUMER_SECRET
    api_url = f"{settings.M_PESA_API_URL}/oauth/v1/generate?grant_type=client_credentials"
    
    # Create auth string
    auth_string = f"{consumer_key}:{consumer_secret}"
    auth_bytes = auth_string.encode("ascii")
    base64_auth = base64.b64encode(auth_bytes).decode("ascii")
    
    headers = {
        "Authorization": f"Basic {base64_auth}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(api_url, headers=headers)
        response.raise_for_status()
        result = response.json()
        return result.get("access_token")
    except Exception as e:
        print(f"Error generating access token: {str(e)}")
        return None

def initiate_stk_push(phone_number: str, amount: float, description: str):
    """
    Initiates an STK push for M-Pesa payment using the Lipa na M-Pesa Online service.

    Args:
        phone_number (str): The phone number to send the STK push to (e.g., in the format '2547XXXXXXXX').
        amount (float): The amount to be paid.
        description (str): A description of the transaction.

    Returns:
        dict: The response from the M-Pesa API as a JSON object.
    """
    access_token = generate_access_token()
    if not access_token:
        raise Exception("Failed to generate M-Pesa access token")
    
    # Format timestamp
    timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    
    # Format phone number (ensure it starts with 254)
    if phone_number.startswith('0'):
        phone_number = '254' + phone_number[1:]
    elif not phone_number.startswith('254'):
        phone_number = '254' + phone_number
    
    # Create password
    shortcode = settings.M_PESA_LIPA_NA_MPESA_SHORTCODE
    passkey = settings.M_PESA_LIPA_NA_MPESA_PASSKEY
    password_string = shortcode + passkey + timestamp
    password = base64.b64encode(password_string.encode()).decode('utf-8')
    
    # Prepare STK Push request
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    stk_url = f"{settings.M_PESA_API_URL}/mpesa/stkpush/v1/processrequest"
    
    payload = {
        "BusinessShortCode": shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),  # M-Pesa requires integer amounts
        "PartyA": phone_number,
        "PartyB": shortcode,
        "PhoneNumber": phone_number,
        "CallBackURL": f"{settings.API_BASE_URL}/api/payments/mpesa/callback",
        "AccountReference": "TradeWizard",
        "TransactionDesc": description
    }
    
    try:
        response = requests.post(stk_url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"STK Push request failed: {str(e)}")
        if hasattr(e.response, 'text'):
            print(f"Response: {e.response.text}")
        raise Exception(f"Failed to initiate M-Pesa payment: {str(e)}")

def verify_stk_push(checkout_request_id: str):
    """
    Verifies the status of an STK push transaction.
    
    Args:
        checkout_request_id (str): The CheckoutRequestID from the STK push request response.
        
    Returns:
        dict: The response from the M-Pesa API with transaction status.
    """
    access_token = generate_access_token()
    if not access_token:
        raise Exception("Failed to generate M-Pesa access token")
    
    # Format timestamp
    timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    
    # Create password
    shortcode = settings.M_PESA_LIPA_NA_MPESA_SHORTCODE
    passkey = settings.M_PESA_LIPA_NA_MPESA_PASSKEY
    password_string = shortcode + passkey + timestamp
    password = base64.b64encode(password_string.encode()).decode('utf-8')
    
    # Prepare query request
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    query_url = f"{settings.M_PESA_API_URL}/mpesa/stkpushquery/v1/query"
    
    payload = {
        "BusinessShortCode": shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "CheckoutRequestID": checkout_request_id
    }
    
    try:
        response = requests.post(query_url, json=payload, headers=headers)
        response.raise_for_status()
        result = response.json()
        
        # Check if transaction was successful (ResultCode: 0 means success)
        return {
            "success": result.get("ResultCode") == "0",
            "response": result
        }
    except requests.exceptions.RequestException as e:
        print(f"STK Query request failed: {str(e)}")
        if hasattr(e.response, 'text'):
            print(f"Response: {e.response.text}")
        raise Exception(f"Failed to verify M-Pesa payment: {str(e)}")
