"""
Configuration management for WhatsNaija AI backend.
Loads and validates environment variables.
"""

from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # WhatsApp Cloud API
    whatsapp_phone_number_id: str = Field(..., env="WHATSAPP_PHONE_NUMBER_ID")
    whatsapp_access_token: str = Field(..., env="WHATSAPP_ACCESS_TOKEN")
    whatsapp_verify_token: str = Field(..., env="WHATSAPP_VERIFY_TOKEN")
    waba_id: str = Field(..., env="WABA_ID")

    # Groq API
    groq_api_key: str = Field(..., env="GROQ_API_KEY")

    # Supabase
    supabase_url: str = Field(..., env="SUPABASE_URL")
    supabase_service_role_key: str = Field(..., env="SUPABASE_SERVICE_ROLE_KEY")
    # JWT secret for verifying dashboard API requests
    # Found in: Supabase Dashboard → Project Settings → API → JWT Secret
    supabase_jwt_secret: str = Field(default="", env="SUPABASE_JWT_SECRET")

    # Application
    app_env: str = Field(default="development", env="APP_ENV")
    base_url: str = Field(default="http://localhost:8000", env="BASE_URL")

    # Paystack (optional — enables payment link generation when set)
    paystack_secret_key: str = Field(default="", env="PAYSTACK_SECRET_KEY")
    paystack_webhook_secret: str = Field(default="", env="PAYSTACK_WEBHOOK_SECRET")

    # Frontend URL (for CORS in production)
    frontend_url: str = Field(default="http://localhost:3000", env="FRONTEND_URL")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

    def __init__(self, **data):
        super().__init__(**data)
        # Enforce JWT secret in production — without it all API auth is bypassed
        if self.app_env == "production" and not self.supabase_jwt_secret:
            raise ValueError(
                "SUPABASE_JWT_SECRET must be set in production. "
                "Get it from: Supabase Dashboard → Project Settings → API → JWT Secret"
            )


# Global settings instance
settings = Settings()
