from pydantic import BaseSettings

class Settings(BaseSettings):
    # Environment variables
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    M_PESA_API_URL: str
    M_PESA_CONSUMER_KEY: str
    M_PESA_CONSUMER_SECRET: str
    M_PESA_SHORTCODE: str
    M_PESA_LIPA_NA_MPESA_SHORTCODE: str
    M_PESA_LIPA_NA_MPESA_SHORTCODE_LIPA: str

    class Config:
        env_file = ".env"

settings = Settings()
