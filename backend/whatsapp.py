"""
WhatsApp Cloud API client.
Handles sending messages via WhatsApp Cloud API.
"""

import httpx
import logging
from typing import Optional

logger = logging.getLogger(__name__)

WHATSAPP_API_BASE = "https://graph.facebook.com/v18.0"


async def send_text_message(
    phone_number_id: str,
    to: str,
    message: str,
    access_token: str
) -> bool:
    """
    Send a text message via WhatsApp Cloud API.

    Args:
        phone_number_id: The Meta Phone Number ID (not the actual phone number)
        to: Recipient's phone number (e.g., "+2348012345678")
        message: Text message to send
        access_token: WhatsApp Access Token

    Returns:
        True if message sent successfully, False otherwise
    """
    url = f"{WHATSAPP_API_BASE}/{phone_number_id}/messages"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "text",
        "text": {
            "preview_url": False,
            "body": message
        }
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload, headers=headers)

            if response.status_code == 200:
                logger.info(f"Message sent successfully to {to}")
                return True
            else:
                logger.error(
                    f"Failed to send message. Status: {response.status_code}, "
                    f"Response: {response.text}"
                )
                return False

    except httpx.TimeoutException:
        logger.error(f"Timeout sending message to {to}")
        return False
    except Exception as e:
        logger.error(f"Error sending message to {to}: {e}")
        return False


async def send_message_with_retry(
    phone_number_id: str,
    to: str,
    message: str,
    access_token: str,
    max_retries: int = 3
) -> bool:
    """
    Send message with retry logic (exponential backoff).

    Args:
        phone_number_id: The Meta Phone Number ID
        to: Recipient's phone number
        message: Text message to send
        access_token: WhatsApp Access Token
        max_retries: Maximum number of retry attempts

    Returns:
        True if message sent successfully, False otherwise
    """
    import asyncio

    for attempt in range(max_retries):
        success = await send_text_message(phone_number_id, to, message, access_token)

        if success:
            return True

        if attempt < max_retries - 1:
            # Exponential backoff: 1s, 2s, 4s
            wait_time = 2 ** attempt
            logger.info(f"Retrying in {wait_time}s... (attempt {attempt + 1}/{max_retries})")
            await asyncio.sleep(wait_time)

    logger.error(f"Failed to send message after {max_retries} attempts")
    return False


async def mark_message_as_read(
    phone_number_id: str,
    message_id: str,
    access_token: str
) -> bool:
    """
    Mark a message as read (optional - improves UX).

    Args:
        phone_number_id: The Meta Phone Number ID
        message_id: WhatsApp message ID to mark as read
        access_token: WhatsApp Access Token

    Returns:
        True if successful, False otherwise
    """
    url = f"{WHATSAPP_API_BASE}/{phone_number_id}/messages"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "messaging_product": "whatsapp",
        "status": "read",
        "message_id": message_id
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload, headers=headers)

            if response.status_code == 200:
                logger.info(f"Message {message_id} marked as read")
                return True
            else:
                logger.warning(
                    f"Failed to mark message as read. Status: {response.status_code}"
                )
                return False

    except Exception as e:
        logger.error(f"Error marking message as read: {e}")
        return False
