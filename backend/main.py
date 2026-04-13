"""
WhatsNaija AI Backend - FastAPI Application
Main entry point for the API server.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
import webhook
import api

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    logger.info("=" * 60)
    logger.info("WhatsNaija AI Backend Starting...")
    logger.info("=" * 60)
    logger.info(f"Environment: {settings.app_env}")
    logger.info(f"Base URL: {settings.base_url}")
    logger.info(f"Supabase URL: {settings.supabase_url}")
    logger.info(f"WhatsApp Phone Number ID: {settings.whatsapp_phone_number_id}")
    logger.info("=" * 60)

    # Verify critical environment variables
    required_vars = [
        "GROQ_API_KEY",
        "WHATSAPP_ACCESS_TOKEN",
        "WHATSAPP_PHONE_NUMBER_ID",
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY"
    ]

    missing_vars = []
    for var in required_vars:
        if not getattr(settings, var.lower(), None):
            missing_vars.append(var)

    if missing_vars:
        logger.error(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        logger.error("Please check your .env file!")
    else:
        logger.info("✅ All required environment variables present")

    logger.info("🚀 Backend is ready!")
    logger.info("=" * 60)

    yield

    # Shutdown
    logger.info("Shutting down WhatsNaija AI Backend...")


# Initialize FastAPI app
app = FastAPI(
    title="WhatsNaija AI",
    description="AI-powered WhatsApp sales and support agent for Nigerian SMBs",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
_cors_origins = list({
    "http://localhost:3000",
    "http://localhost:3001",
    settings.base_url,
    settings.frontend_url,
})

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Include routers
app.include_router(webhook.router, tags=["webhook"])
app.include_router(api.router, tags=["api"])


@app.get("/")
async def root():
    """Root endpoint - health check."""
    return {
        "service": "WhatsNaija AI Backend",
        "status": "running",
        "version": "1.0.0",
        "environment": settings.app_env
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "environment": settings.app_env,
        "services": {
            "api": "operational",
            "database": "connected",
            "whatsapp": "configured"
        }
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.app_env == "development" else False
    )
