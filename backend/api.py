"""
Owner API endpoints.
Handles manual message sending and bot control from the dashboard.
All routes require a valid Supabase JWT (sent as Bearer token by the frontend).
"""

import logging
import jwt
from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from database import supabase, save_message
from whatsapp import send_message_with_retry
from config import settings
from uuid import UUID

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")


# ─────────────────────────────────────────────
# Auth dependency
# ─────────────────────────────────────────────

async def get_current_user(authorization: str = Header(default=None)) -> str:
    """
    Verify the Supabase JWT sent by the dashboard.
    Returns the user's UUID (sub claim) on success.
    Skips verification if SUPABASE_JWT_SECRET is not configured (dev mode).
    """
    if not settings.supabase_jwt_secret:
        # JWT secret not configured — skip verification in dev
        # Set SUPABASE_JWT_SECRET in .env before going to production
        logger.warning("SUPABASE_JWT_SECRET not set — skipping token verification (dev mode)")
        return "dev-user"

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            options={"verify_aud": False},  # Supabase tokens have aud = "authenticated"
        )
        return payload["sub"]  # The user's UUID
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")


async def verify_business_owner(business_id: str, user_id: str) -> dict:
    """Confirm that the authenticated user owns the given business."""
    result = supabase.table("businesses").select("owner_id, phone_number_id, is_active").eq("id", business_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Business not found")
    business = result.data[0]
    if user_id != "dev-user" and business["owner_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return business


# ─────────────────────────────────────────────
# Request models
# ─────────────────────────────────────────────

class SendMessageRequest(BaseModel):
    business_id: str
    customer_phone: str
    message: str
    conversation_id: str | None = None


class BotStatusRequest(BaseModel):
    business_id: str
    is_active: bool


class ConversationStatusRequest(BaseModel):
    conversation_id: str
    status: str  # 'bot' | 'human' | 'closed'


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────

@router.post("/send-message")
async def send_owner_message(
    req: SendMessageRequest,
    user_id: str = Depends(get_current_user),
):
    """Send a manual WhatsApp message from the business owner."""
    try:
        business = await verify_business_owner(req.business_id, user_id)

        # Fetch full business for phone_number_id
        full = supabase.table("businesses").select("*").eq("id", req.business_id).execute()
        if not full.data:
            return {"success": False, "error": "Business not found"}
        biz = full.data[0]

        # Send via WhatsApp (use per-business token if set)
        access_token = biz.get("whatsapp_access_token") or settings.whatsapp_access_token
        success = await send_message_with_retry(
            phone_number_id=biz["phone_number_id"],
            to=req.customer_phone,
            message=req.message,
            access_token=access_token,
        )

        if not success:
            return {"success": False, "error": "Failed to send WhatsApp message"}

        # Resolve conversation_id
        conversation_id = req.conversation_id
        if not conversation_id:
            conv = (
                supabase.table("conversations")
                .select("id")
                .eq("business_id", req.business_id)
                .eq("customer_phone", req.customer_phone)
                .order("last_message_at", desc=True)
                .limit(1)
                .execute()
            )
            if conv.data:
                conversation_id = conv.data[0]["id"]

        if conversation_id:
            save_message(UUID(conversation_id), "owner", req.message)
            supabase.table("conversations").update({"status": "human"}).eq(
                "id", conversation_id
            ).execute()

        logger.info(f"Owner message sent to {req.customer_phone} by user {user_id}")
        return {"success": True}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending owner message: {e}", exc_info=True)
        return {"success": False, "error": str(e)}


@router.post("/bot-status")
async def set_bot_status(
    req: BotStatusRequest,
    user_id: str = Depends(get_current_user),
):
    """Toggle the bot active/inactive for a business."""
    try:
        await verify_business_owner(req.business_id, user_id)
        supabase.table("businesses").update({"is_active": req.is_active}).eq(
            "id", req.business_id
        ).execute()
        return {"success": True, "is_active": req.is_active}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error toggling bot status: {e}", exc_info=True)
        return {"success": False, "error": str(e)}


@router.post("/conversation-status")
async def set_conversation_status(
    req: ConversationStatusRequest,
    user_id: str = Depends(get_current_user),
):
    """Update a conversation's handling status (bot / human / closed)."""
    try:
        # Verify ownership via conversation → business
        conv = supabase.table("conversations").select("business_id").eq(
            "id", req.conversation_id
        ).execute()
        if not conv.data:
            raise HTTPException(status_code=404, detail="Conversation not found")

        await verify_business_owner(conv.data[0]["business_id"], user_id)

        supabase.table("conversations").update({"status": req.status}).eq(
            "id", req.conversation_id
        ).execute()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating conversation status: {e}", exc_info=True)
        return {"success": False, "error": str(e)}
