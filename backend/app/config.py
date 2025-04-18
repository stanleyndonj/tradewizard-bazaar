
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Environment variables - with development defaults for Replit
    DATABASE_URL: str = "sqlite:///./tradewizard.db"
    JWT_SECRET_KEY: str = "development_secret_key_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours by default
    
    # M-Pesa API settings - with placeholders for development
    M_PESA_API_URL: str = "https://sandbox.safaricom.co.ke"
    M_PESA_CONSUMER_KEY: str = "dummy_consumer_key"
    M_PESA_CONSUMER_SECRET: str = "dummy_consumer_secret"
    M_PESA_SHORTCODE: str = "174379"
    M_PESA_LIPA_NA_MPESA_SHORTCODE: str = "174379"
    M_PESA_LIPA_NA_MPESA_SHORTCODE_LIPA: str = "174379"
    M_PESA_LIPA_NA_MPESA_PASSKEY: str = "dummy_passkey"
    
    # API base URL for callbacks
    API_BASE_URL: str = "http://localhost:8000"
    
    # Card payment settings (for real implementations)
    # STRIPE_API_KEY: str = ""
    # STRIPE_WEBHOOK_SECRET: str = ""
    # FLUTTER_WAVE_API_KEY: str = ""
    # PAYSTACK_SECRET_KEY: str = ""

    # Add new settings for payment and admin configuration
    ADMIN_EMAILS: list = ["admin@example.com"]  # List of admin email addresses
    DISABLE_SUBSCRIPTION_CHECK: bool = False  # Global override for subscription checks

    class Config:
        env_file = ".env"

settings = Settings()
