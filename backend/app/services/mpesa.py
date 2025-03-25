import requests
from app.config import settings

def lipa_na_mpesa(amount: float, phone_number: str):
    headers = {
        "Authorization": f"Bearer {settings.M_PESA_CONSUMER_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "Shortcode": settings.M_PESA_LIPA_NA_MPESA_SHORTCODE,
        "LipaNaMpesaOnlineShortcode": settings.M_PESA_LIPA_NA_MPESA_SHORTCODE_LIPA,
        "Amount": amount,
        "PhoneNumber": phone_number,
        "CallBackURL": "https://your_callback_url"
    }

    response = requests.post(settings.M_PESA_API_URL + "/lipa-na-mpesa", json=payload, headers=headers)
    return response.json()
