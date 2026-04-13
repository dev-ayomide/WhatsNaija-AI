"""
Pydantic models for WhatsNaija AI.
Defines data structures for validation and type safety.
"""

from typing import Optional, List, Literal
from datetime import datetime
from pydantic import BaseModel, Field
from uuid import UUID


# =============================================================================
# Database Models
# =============================================================================

class Business(BaseModel):
    """Business model matching the businesses table."""
    id: UUID
    owner_id: UUID
    name: str
    whatsapp_number: str
    phone_number_id: str
    waba_id: str
    paystack_secret: Optional[str] = None
    business_type: Optional[str] = None
    tone_preference: Literal["formal", "casual", "pidgin"] = "casual"
    is_active: bool = True
    created_at: datetime
    updated_at: datetime


class KnowledgeBase(BaseModel):
    """Knowledge base item model."""
    id: UUID
    business_id: UUID
    type: Literal["product", "faq", "policy", "greeting"]
    question: Optional[str] = None
    answer: str
    product_name: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    is_active: bool = True
    created_at: datetime
    updated_at: datetime


class Conversation(BaseModel):
    """Conversation model matching the conversations table."""
    id: UUID
    business_id: UUID
    customer_phone: str
    customer_name: Optional[str] = None
    status: Literal["bot", "human", "closed"] = "bot"
    started_at: datetime
    last_message_at: datetime


class Message(BaseModel):
    """Message model matching the messages table."""
    id: UUID
    conversation_id: UUID
    role: Literal["customer", "bot", "owner"]
    content: str
    wa_message_id: Optional[str] = None
    wa_status: Optional[Literal["sent", "delivered", "read", "failed"]] = None
    sent_at: datetime


class Lead(BaseModel):
    """Lead model matching the leads table."""
    id: UUID
    business_id: UUID
    conversation_id: Optional[UUID] = None
    customer_name: Optional[str] = None
    customer_phone: str
    product_interest: Optional[str] = None
    budget_range: Optional[str] = None
    timeline: Optional[str] = None
    status: Literal["new", "contacted", "converted", "lost"] = "new"
    notes: Optional[str] = None
    captured_at: datetime
    updated_at: datetime


# =============================================================================
# WhatsApp Webhook Models
# =============================================================================

class WhatsAppMessage(BaseModel):
    """WhatsApp incoming message structure."""
    from_: str = Field(..., alias="from")  # Customer phone number
    id: str  # WhatsApp message ID
    timestamp: str
    type: str  # "text", "image", "audio", etc.
    text: Optional[dict] = None  # {"body": "message content"}
    image: Optional[dict] = None
    audio: Optional[dict] = None


class WhatsAppChange(BaseModel):
    """WhatsApp webhook change object."""
    value: dict
    field: str


class WhatsAppEntry(BaseModel):
    """WhatsApp webhook entry object."""
    id: str
    changes: List[WhatsAppChange]


class WhatsAppWebhook(BaseModel):
    """WhatsApp webhook payload structure."""
    object: str
    entry: List[WhatsAppEntry]


# =============================================================================
# Agent Action Models
# =============================================================================

class AgentAction(BaseModel):
    """Actions that the agent can trigger."""
    type: Literal["send_payment_link", "check_booking", "human_handoff", "capture_lead"]
    amount: Optional[float] = None
    description: Optional[str] = None
    service: Optional[str] = None
    requested_time: Optional[str] = None
    lead_data: Optional[dict] = None


# =============================================================================
# API Request/Response Models
# =============================================================================

class MessageRequest(BaseModel):
    """Request to send a message (for dashboard use)."""
    conversation_id: UUID
    content: str


class ConversationUpdate(BaseModel):
    """Update conversation status."""
    status: Literal["bot", "human", "closed"]


class KnowledgeBaseCreate(BaseModel):
    """Create or update knowledge base item."""
    type: Literal["product", "faq", "policy", "greeting"]
    question: Optional[str] = None
    answer: str
    product_name: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None


class LeadUpdate(BaseModel):
    """Update lead status."""
    status: Literal["new", "contacted", "converted", "lost"]
    notes: Optional[str] = None
