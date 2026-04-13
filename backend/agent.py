"""
AI Agent core logic using Groq (Llama 3 model).
Handles conversation processing, response generation, and action parsing.
"""

import re
import logging
import httpx
from typing import Dict, List, Tuple, Optional, Any
from uuid import UUID
from datetime import datetime, timedelta
from groq import Groq
from config import settings
from database import (
    get_business_by_id,
    get_knowledge_base,
    get_conversation_history,
    save_message,
    create_lead,
    create_booking,
    update_conversation_status
)
from knowledge import build_knowledge_context
from whatsapp import send_message_with_retry

logger = logging.getLogger(__name__)

# Initialize Groq client
client = Groq(api_key=settings.groq_api_key)


def build_system_prompt(business: Dict[str, Any], knowledge_context: Dict[str, str]) -> str:
    """
    Build the system prompt for Claude based on business knowledge.

    Args:
        business: Business data from database
        knowledge_context: Formatted knowledge (products, faqs, policies)

    Returns:
        System prompt string
    """
    business_name = business.get("name", "this business")
    business_type = business.get("business_type", "business")
    tone_preference = business.get("tone_preference", "casual")

    # Tone instruction based on preference
    tone_instructions = {
        "formal": "Be professional and formal in your responses.",
        "casual": "Be friendly and conversational, like a helpful person who works here.",
        "pidgin": "Respond in Nigerian Pidgin English when appropriate, matching the customer's energy."
    }
    tone_instruction = tone_instructions.get(tone_preference, tone_instructions["casual"])

    system_prompt = f"""You are an AI sales and support assistant for {business_name}, a {business_type} business in Nigeria.

TONE AND STYLE:
{tone_instruction}
- If customer writes in Pidgin, reply in Pidgin
- If customer writes in formal English, match their formality
- If customer writes casually, be warm and friendly
- Never sound robotic. Sound like a helpful Nigerian person who knows this business well.

PRODUCTS AND SERVICES:
{knowledge_context.get('products', 'No products listed.')}

FREQUENTLY ASKED QUESTIONS:
{knowledge_context.get('faqs', 'No FAQs available.')}

POLICIES:
{knowledge_context.get('policies', 'No specific policies.')}

YOUR GOALS (in order of priority):
1. Answer the customer's question accurately from the knowledge base above
2. If they seem interested in buying, ask what exactly they want and confirm the price
3. If they are ready to pay, say "Let me send you a payment link" and output: [SEND_PAYMENT_LINK: amount=AMOUNT, description=DESCRIPTION]
4. If they want to book an appointment, say you'll check availability and output: [CHECK_BOOKING: service=SERVICE]
5. If you don't know the answer or need human help, say "Let me connect you with someone who can help" and output: [HUMAN_HANDOFF]
6. If this is a promising lead (customer shows buying intent), collect their name naturally if you don't have it yet

CRITICAL RULES:
- Never make up prices or policies not listed above
- Never promise things not in the knowledge base
- Keep replies SHORT — 1 to 3 sentences max unless explaining something complex
- If customer is rude or abusive, politely disengage: "I can only help with questions about {business_name}."
- Do not discuss competitors
- If asked about illegal activities, immediately respond with [HUMAN_HANDOFF]

SPECIAL ACTIONS (use these exact formats):
- To send payment link: [SEND_PAYMENT_LINK: amount=15000, description=Blue Ankara Dress]
- To check booking: [CHECK_BOOKING: service=Fitting Appointment]
- To escalate to human: [HUMAN_HANDOFF]

Remember: Be helpful, warm, and professional. You represent {business_name}!"""

    return system_prompt


def format_conversation_history(messages: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    """
    Format conversation history for Claude API.

    Args:
        messages: List of message dicts from database

    Returns:
        List of messages in Claude format [{"role": "user"|"assistant", "content": "..."}]
    """
    formatted = []

    for msg in messages:
        role = msg.get("role")
        content = msg.get("content", "")

        # Map database roles to Claude roles
        if role == "customer":
            claude_role = "user"
        elif role in ["bot", "owner"]:
            claude_role = "assistant"
        else:
            continue  # Skip unknown roles

        formatted.append({
            "role": claude_role,
            "content": content
        })

    return formatted


async def generate_response(
    conversation_history: List[Dict[str, str]],
    system_prompt: str,
    customer_message: str
) -> Optional[str]:
    """
    Generate response using Groq (Llama 3.3 70B).

    Args:
        conversation_history: Previous messages in chat format
        system_prompt: System prompt for context
        customer_message: The new customer message

    Returns:
        AI's response or None if error
    """
    # Build messages with system prompt first, then history, then new message
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(conversation_history)
    messages.append({"role": "user", "content": customer_message})

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # Fast and powerful Llama model
            messages=messages,
            max_tokens=1024,
            temperature=0.7,
        )

        # Extract text content
        if response.choices and len(response.choices) > 0:
            return response.choices[0].message.content

        return None

    except Exception as e:
        logger.error(f"Groq API error: {e}")
        return None


def parse_actions(response: str) -> Tuple[str, List[str]]:
    """
    Parse action tokens from Claude's response.

    Args:
        response: Claude's response text

    Returns:
        Tuple of (cleaned_response, list_of_actions)
    """
    actions = []
    cleaned_response = response

    # Check for SEND_PAYMENT_LINK
    payment_pattern = r'\[SEND_PAYMENT_LINK:\s*amount=([0-9.]+),?\s*description=([^\]]+)\]'
    payment_matches = re.findall(payment_pattern, response, re.IGNORECASE)

    for match in payment_matches:
        amount = match[0]
        description = match[1].strip()
        actions.append(f"SEND_PAYMENT_LINK|{amount}|{description}")
        # Remove the action token from response
        cleaned_response = re.sub(
            r'\[SEND_PAYMENT_LINK:[^\]]+\]',
            '',
            cleaned_response,
            flags=re.IGNORECASE
        )

    # Check for CHECK_BOOKING
    booking_pattern = r'\[CHECK_BOOKING:\s*service=([^\]]+)\]'
    booking_matches = re.findall(booking_pattern, response, re.IGNORECASE)

    for match in booking_matches:
        service = match.strip()
        actions.append(f"CHECK_BOOKING|{service}")
        cleaned_response = re.sub(
            r'\[CHECK_BOOKING:[^\]]+\]',
            '',
            cleaned_response,
            flags=re.IGNORECASE
        )

    # Check for HUMAN_HANDOFF
    if re.search(r'\[HUMAN_HANDOFF\]', response, re.IGNORECASE):
        actions.append("HUMAN_HANDOFF")
        cleaned_response = re.sub(
            r'\[HUMAN_HANDOFF\]',
            '',
            cleaned_response,
            flags=re.IGNORECASE
        )

    # Clean up extra whitespace
    cleaned_response = cleaned_response.strip()

    return cleaned_response, actions


async def _create_paystack_link(amount_naira: float, description: str, customer_phone: str) -> Optional[str]:
    """
    Create a Paystack payment link.
    Returns the payment URL or None if Paystack is not configured / call fails.
    """
    if not settings.paystack_secret_key:
        return None

    try:
        amount_kobo = int(float(amount_naira) * 100)
        # Paystack requires email — use phone as placeholder
        placeholder_email = f"{customer_phone.lstrip('+').replace(' ', '')}@pay.whatsnaijaai.com"

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.paystack.co/transaction/initialize",
                headers={
                    "Authorization": f"Bearer {settings.paystack_secret_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "email": placeholder_email,
                    "amount": amount_kobo,
                    "metadata": {"description": description, "customer_phone": customer_phone},
                },
                timeout=10,
            )
            data = resp.json()
            if data.get("status") and data.get("data", {}).get("authorization_url"):
                return data["data"]["authorization_url"]
    except Exception as e:
        logger.error(f"Paystack error: {e}")

    return None


async def execute_actions(
    actions: List[str],
    business: Dict[str, Any],
    conversation_id: UUID,
    customer_phone: str
):
    """
    Execute actions parsed from the AI's response.
    Now receives the full business dict so it can send follow-up messages.
    """
    business_id = UUID(business["id"])
    phone_number_id = business.get("phone_number_id")
    access_token = business.get("whatsapp_access_token") or settings.whatsapp_access_token

    for action in actions:
        # ── Payment link ────────────────────────────────────────────
        if action.startswith("SEND_PAYMENT_LINK"):
            parts = action.split("|")
            if len(parts) >= 3:
                amount_str, description = parts[1], parts[2]
                logger.info(f"Payment link requested: ₦{amount_str} for {description}")

                try:
                    link = await _create_paystack_link(float(amount_str), description, customer_phone)
                except Exception:
                    link = None

                if link:
                    msg = f"Here's your secure payment link for {description} (₦{amount_str}):\n{link}\n\nThe link expires in 24 hours. Reply after paying and we'll confirm your order!"
                else:
                    # Paystack not configured — give a manual instruction
                    msg = f"To pay ₦{amount_str} for {description}, please make a bank transfer and send your proof of payment. We'll confirm your order right away!"

                await send_message_with_retry(phone_number_id, customer_phone, msg, access_token)
                save_message(conversation_id, "bot", msg)

        # ── Booking ─────────────────────────────────────────────────
        elif action.startswith("CHECK_BOOKING"):
            parts = action.split("|")
            service = parts[1].strip() if len(parts) >= 2 else "appointment"
            logger.info(f"Booking requested for: {service}")

            # Create a booking record (owner will see it in the Bookings page)
            scheduled_at = datetime.now() + timedelta(days=1)
            create_booking(
                business_id=business_id,
                conversation_id=conversation_id,
                customer_phone=customer_phone,
                scheduled_at=scheduled_at,
                service=service,
            )

            msg = f"Your {service} request has been noted! Our team will reach out shortly to confirm a date and time that works for you."
            await send_message_with_retry(phone_number_id, customer_phone, msg, access_token)
            save_message(conversation_id, "bot", msg)

        # ── Human handoff ────────────────────────────────────────────
        elif action == "HUMAN_HANDOFF":
            logger.info(f"Human handoff for conversation {conversation_id}")
            update_conversation_status(conversation_id, "human")


async def process_customer_message(
    business_id: UUID,
    conversation_id: UUID,
    customer_phone: str,
    customer_message: str,
    wa_message_id: str
):
    """
    Main function to process a customer message and generate a response.

    Args:
        business_id: Business ID
        conversation_id: Conversation ID
        customer_phone: Customer phone number
        customer_message: The message text from customer
        wa_message_id: WhatsApp message ID (for deduplication)
    """
    try:
        # 1. Get business data
        business = get_business_by_id(business_id)
        if not business:
            logger.error(f"Business {business_id} not found")
            return

        # Check if conversation is in human mode
        from database import get_conversation
        conversation = get_conversation(business_id, customer_phone)
        if conversation and conversation.get("status") == "human":
            logger.info(f"Conversation {conversation_id} is in human mode, skipping bot response")
            # Save customer message but don't respond
            save_message(conversation_id, "customer", customer_message, wa_message_id)
            return

        # 2. Get knowledge base
        knowledge = get_knowledge_base(business_id)
        knowledge_context = build_knowledge_context(knowledge)

        # 3. Build system prompt
        system_prompt = build_system_prompt(business, knowledge_context)

        # 4. Get conversation history
        history_messages = get_conversation_history(conversation_id, limit=10)
        conversation_history = format_conversation_history(history_messages)

        # 5. Save customer message
        save_message(conversation_id, "customer", customer_message, wa_message_id)

        # 6. Generate response
        logger.info(f"Generating response for conversation {conversation_id}")
        response = await generate_response(
            conversation_history,
            system_prompt,
            customer_message
        )

        if not response:
            logger.error("Failed to generate response")
            # Send fallback message
            response = "Sorry, I'm having trouble right now. Let me connect you with someone who can help."
            update_conversation_status(conversation_id, "human")

        # 7. Parse actions
        cleaned_response, actions = parse_actions(response)

        # 8. Execute actions (pass full business for phone_number_id + token)
        if actions:
            await execute_actions(actions, business, conversation_id, customer_phone)

        # 9. Send response to customer
        phone_number_id = business.get("phone_number_id")
        # Use per-business token if set; fall back to platform .env token for dev
        access_token = business.get("whatsapp_access_token") or settings.whatsapp_access_token

        success = await send_message_with_retry(
            phone_number_id,
            customer_phone,
            cleaned_response,
            access_token
        )

        if success:
            # 10. Save bot message
            save_message(conversation_id, "bot", cleaned_response)
            logger.info(f"Response sent successfully to {customer_phone}")
        else:
            logger.error(f"Failed to send response to {customer_phone}")

    except Exception as e:
        logger.error(f"Error processing customer message: {e}", exc_info=True)
