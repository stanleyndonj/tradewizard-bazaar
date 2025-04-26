import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# ✅ Manually load .env from the current file's directory
dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path)

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    M_PESA_API_URL: str
    M_PESA_CONSUMER_KEY: str
    M_PESA_CONSUMER_SECRET: str
    M_PESA_SHORTCODE: str
    M_PESA_LIPA_NA_MPESA_SHORTCODE: str
    M_PESA_LIPA_NA_MPESA_SHORTCODE_LIPA: str
    M_PESA_LIPA_NA_MPESA_PASSKEY: str = ""

    API_BASE_URL: str = "http://localhost:8000"
    ADMIN_EMAILS: list[str] = ["admin@example.com"]
    DISABLE_SUBSCRIPTION_CHECK: bool = False

    class Config:
        env_file = ".env"  # Optional now, since we're manually loading

# ✅ Instantiate the Settings object so you can import it elsewhere
settings = Settings()
