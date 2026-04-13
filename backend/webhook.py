"""
WhatsApp webhook handlers.
Receives and processes incoming messages from Meta's WhatsApp Cloud API.
"""

import logging
from fastapi import APIRouter, Request, Query, HTTPException, BackgroundTasks
from fastapi.responses import PlainTextResponse
from uuid import UUID
from config import settings
from database import (
    get_business_by_phone_number_id,
    get_or_create_conversation,
    message_exists
)
from agent import process_customer_message

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/webhook")
async def verify_webhook(
    hub_mode: str = Query(alias="hub.mode"),
    hub_challenge: str = Query(alias="hub.challenge"),
    hub_verify_token: str = Query(alias="hub.verify_token")
):
    """
    Webhook verification endpoint for Meta.
    Meta calls this once during webhook setup to verify the endpoint.

    Args:
        hub_mode: Should be "subscribe"
        hub_challenge: Random string from Meta to echo back
        hub_verify_token: Token to verify (must match WHATSAPP_VERIFY_TOKEN)

    Returns:
        The challenge string if verification succeeds
    """
    logger.info(f"Webhook verification request: mode={hub_mode}, token={hub_verify_token}")

    if hub_mode == "subscribe" and hub_verify_token == settings.whatsapp_verify_token:
        logger.info("Webhook verified successfully!")
        return PlainTextResponse(hub_challenge)

    logger.warning("Webhook verification failed: invalid token")
    raise HTTPException(status_code=403, detail="Verification failed")


@router.post("/webhook")
async def receive_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Webhook endpoint to receive incoming WhatsApp messages.
    Meta sends POST requests here whenever a message is received.

    Args:
        request: FastAPI request object with webhook payload
        background_tasks: For processing messages asynchronously

    Returns:
        200 OK immediately to acknowledge receipt
    """
    print("\n🚨 WEBHOOK POST RECEIVED!")
    import sys
    sys.stdout.flush()  # Force output to show immediately
    try:
        # Parse webhook payload
        payload = await request.json()
        logger.info(f"Received webhook payload: {payload}")

        # Verify this is a WhatsApp message webhook
        if payload.get("object") != "whatsapp_business_account":
            logger.warning(f"Unknown webhook object type: {payload.get('object')}")
            return {"status": "ignored"}

        # Extract message data
        entry = payload.get("entry", [])
        if not entry:
            logger.warning("No entry in webhook payload")
            return {"status": "no_entry"}

        for item in entry:
            changes = item.get("changes", [])

            for change in changes:
                value = change.get("value", {})

                # Check if this is a message event
                messages = value.get("messages", [])
                if not messages:
                    continue

                # Get metadata
                metadata = value.get("metadata", {})
                phone_number_id = metadata.get("phone_number_id")

                if not phone_number_id:
                    logger.warning("No phone_number_id in webhook")
                    continue

                # Process each message
                for message in messages:
                    # Add to background tasks for async processing
                    background_tasks.add_task(
                        process_incoming_message,
                        phone_number_id,
                        message
                    )

        # Acknowledge receipt immediately
        return {"status": "received"}

    except Exception as e:
        logger.error(f"Error processing webhook: {e}", exc_info=True)
        # Still return 200 to prevent Meta from retrying
        return {"status": "error"}


async def process_incoming_message(phone_number_id: str, message: dict):
    """
    Process a single incoming message.
    This runs in the background after webhook returns 200 OK.

    Args:
        phone_number_id: Meta's Phone Number ID
        message: Message data from webhook
    """
    import sys
    print("\n" + "="*60)
    print("🔔 WEBHOOK RECEIVED - PROCESSING MESSAGE")
    print("="*60)
    sys.stdout.flush()
    try:
        # Extract message details
        wa_message_id = message.get("id")
        customer_phone = message.get("from")
        # Ensure phone number has + prefix for WhatsApp API
        if customer_phone and not customer_phone.startswith("+"):
            customer_phone = f"+{customer_phone}"
        message_type = message.get("type")
        timestamp = message.get("timestamp")

        print(f"📱 Message ID: {wa_message_id}")
        print(f"📞 From: {customer_phone}")
        print(f"📝 Type: {message_type}")
        logger.info(
            f"Processing message {wa_message_id} from {customer_phone} "
            f"(type: {message_type})"
        )

        # Check for duplicate (WhatsApp may send same message multiple times)
        if message_exists(wa_message_id):
            logger.info(f"Message {wa_message_id} already processed, skipping")
            return

        # Only handle text messages for now
        if message_type != "text":
            logger.info(f"Non-text message type {message_type}, skipping for now")
            return

        # Extract message text
        text_data = message.get("text", {})
        message_text = text_data.get("body", "")

        if not message_text:
            logger.warning("Empty message text")
            return

        # 1. Find which business this message is for
        print(f"🔍 Looking for business with phone_number_id: {phone_number_id}")
        business = get_business_by_phone_number_id(phone_number_id)

        if not business:
            print(f"❌ ERROR: No business found for phone_number_id: {phone_number_id}")
            logger.error(
                f"No business found for phone_number_id: {phone_number_id}"
            )
            return

        business_id = UUID(business["id"])
        print(f"✅ Business found: {business.get('name')}")
        logger.info(f"Message is for business: {business.get('name')} ({business_id})")

        # 2. Get or create conversation
        conversation = get_or_create_conversation(business_id, customer_phone)

        if not conversation:
            logger.error("Failed to create/get conversation")
            return

        conversation_id = UUID(conversation["id"])

        # 3. Process the message with AI agent
        print(f"🤖 Calling AI agent to generate response...")
        await process_customer_message(
            business_id=business_id,
            conversation_id=conversation_id,
            customer_phone=customer_phone,
            customer_message=message_text,
            wa_message_id=wa_message_id
        )

        print(f"✅ SUCCESS! Message processed")
        print("="*60 + "\n")
        logger.info(f"Successfully processed message {wa_message_id}")

    except Exception as e:
        print(f"❌ ERROR in process_incoming_message: {e}")
        print("="*60 + "\n")
        logger.error(f"Error in process_incoming_message: {e}", exc_info=True)
