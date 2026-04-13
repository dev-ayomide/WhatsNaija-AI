"""
Database operations using Supabase.
Handles all CRUD operations for conversations, messages, leads, etc.
"""

from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from supabase import create_client, Client
from config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize Supabase client
supabase: Client = create_client(
    settings.supabase_url,
    settings.supabase_service_role_key
)


# =============================================================================
# Business Operations
# =============================================================================

def get_business_by_phone_number_id(phone_number_id: str) -> Optional[Dict[str, Any]]:
    """Get business by Meta's phone number ID."""
    try:
        response = supabase.table("businesses").select("*").eq(
            "phone_number_id", phone_number_id
        ).eq("is_active", True).execute()

        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        logger.error(f"Error fetching business: {e}")
        return None


def get_business_by_id(business_id: UUID) -> Optional[Dict[str, Any]]:
    """Get business by ID."""
    try:
        response = supabase.table("businesses").select("*").eq(
            "id", str(business_id)
        ).execute()

        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        logger.error(f"Error fetching business: {e}")
        return None


# =============================================================================
# Knowledge Base Operations
# =============================================================================

def get_knowledge_base(business_id: UUID) -> Dict[str, List[Dict[str, Any]]]:
    """
    Get all active knowledge base items for a business.
    Returns organized dict: {products: [], faqs: [], policies: [], greetings: []}
    """
    try:
        response = supabase.table("knowledge_base").select("*").eq(
            "business_id", str(business_id)
        ).eq("is_active", True).execute()

        knowledge = {
            "products": [],
            "faqs": [],
            "policies": [],
            "greetings": []
        }

        for item in response.data:
            item_type = item.get("type")
            if item_type == "product":
                knowledge["products"].append(item)
            elif item_type == "faq":
                knowledge["faqs"].append(item)
            elif item_type == "policy":
                knowledge["policies"].append(item)
            elif item_type == "greeting":
                knowledge["greetings"].append(item)

        return knowledge
    except Exception as e:
        logger.error(f"Error fetching knowledge base: {e}")
        return {"products": [], "faqs": [], "policies": [], "greetings": []}


# =============================================================================
# Conversation Operations
# =============================================================================

def get_conversation(business_id: UUID, customer_phone: str) -> Optional[Dict[str, Any]]:
    """Get existing conversation for a business-customer pair."""
    try:
        response = supabase.table("conversations").select("*").eq(
            "business_id", str(business_id)
        ).eq("customer_phone", customer_phone).execute()

        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        logger.error(f"Error fetching conversation: {e}")
        return None


def create_conversation(business_id: UUID, customer_phone: str) -> Optional[Dict[str, Any]]:
    """Create a new conversation."""
    try:
        response = supabase.table("conversations").insert({
            "business_id": str(business_id),
            "customer_phone": customer_phone,
            "status": "bot"
        }).execute()

        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        logger.error(f"Error creating conversation: {e}")
        return None


def get_or_create_conversation(business_id: UUID, customer_phone: str) -> Optional[Dict[str, Any]]:
    """Get existing conversation or create new one."""
    conversation = get_conversation(business_id, customer_phone)
    if conversation:
        return conversation
    return create_conversation(business_id, customer_phone)


def update_conversation_status(conversation_id: UUID, status: str) -> bool:
    """Update conversation status (bot, human, closed)."""
    try:
        supabase.table("conversations").update({
            "status": status
        }).eq("id", str(conversation_id)).execute()
        return True
    except Exception as e:
        logger.error(f"Error updating conversation status: {e}")
        return False


# =============================================================================
# Message Operations
# =============================================================================

def save_message(
    conversation_id: UUID,
    role: str,
    content: str,
    wa_message_id: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """Save a message to the database."""
    try:
        message_data = {
            "conversation_id": str(conversation_id),
            "role": role,
            "content": content
        }

        if wa_message_id:
            message_data["wa_message_id"] = wa_message_id

        response = supabase.table("messages").insert(message_data).execute()

        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        logger.error(f"Error saving message: {e}")
        return None


def message_exists(wa_message_id: str) -> bool:
    """Check if message with this WhatsApp ID already exists (deduplication)."""
    try:
        response = supabase.table("messages").select("id").eq(
            "wa_message_id", wa_message_id
        ).execute()

        return len(response.data) > 0
    except Exception as e:
        logger.error(f"Error checking message existence: {e}")
        return False


def get_conversation_history(conversation_id: UUID, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Get recent messages from a conversation.
    Returns messages in chronological order (oldest first).
    """
    try:
        response = supabase.table("messages").select("*").eq(
            "conversation_id", str(conversation_id)
        ).order("sent_at", desc=False).limit(limit).execute()

        return response.data
    except Exception as e:
        logger.error(f"Error fetching conversation history: {e}")
        return []


# =============================================================================
# Lead Operations
# =============================================================================

def create_lead(
    business_id: UUID,
    conversation_id: UUID,
    customer_phone: str,
    customer_name: Optional[str] = None,
    product_interest: Optional[str] = None,
    budget_range: Optional[str] = None,
    timeline: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """Create a new lead."""
    try:
        lead_data = {
            "business_id": str(business_id),
            "conversation_id": str(conversation_id),
            "customer_phone": customer_phone
        }

        if customer_name:
            lead_data["customer_name"] = customer_name
        if product_interest:
            lead_data["product_interest"] = product_interest
        if budget_range:
            lead_data["budget_range"] = budget_range
        if timeline:
            lead_data["timeline"] = timeline

        response = supabase.table("leads").insert(lead_data).execute()

        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        logger.error(f"Error creating lead: {e}")
        return None


def update_lead(lead_id: UUID, **kwargs) -> bool:
    """Update lead with provided fields."""
    try:
        supabase.table("leads").update(kwargs).eq("id", str(lead_id)).execute()
        return True
    except Exception as e:
        logger.error(f"Error updating lead: {e}")
        return False


# =============================================================================
# Payment Link Operations (for future use)
# =============================================================================

def create_payment_link(
    business_id: UUID,
    conversation_id: UUID,
    paystack_ref: str,
    amount: float,
    customer_phone: str,
    payment_url: str,
    description: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """Create a payment link record."""
    try:
        payment_data = {
            "business_id": str(business_id),
            "conversation_id": str(conversation_id),
            "paystack_ref": paystack_ref,
            "amount": amount,
            "customer_phone": customer_phone,
            "payment_url": payment_url,
            "status": "sent"
        }

        if description:
            payment_data["description"] = description

        response = supabase.table("payment_links").insert(payment_data).execute()

        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        logger.error(f"Error creating payment link: {e}")
        return None


# =============================================================================
# Booking Operations (for future use)
# =============================================================================

def create_booking(
    business_id: UUID,
    conversation_id: UUID,
    customer_phone: str,
    scheduled_at: datetime,
    customer_name: Optional[str] = None,
    service: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """Create a booking record."""
    try:
        booking_data = {
            "business_id": str(business_id),
            "conversation_id": str(conversation_id),
            "customer_phone": customer_phone,
            "scheduled_at": scheduled_at.isoformat(),
            "status": "pending"
        }

        if customer_name:
            booking_data["customer_name"] = customer_name
        if service:
            booking_data["service"] = service

        response = supabase.table("bookings").insert(booking_data).execute()

        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        logger.error(f"Error creating booking: {e}")
        return None
