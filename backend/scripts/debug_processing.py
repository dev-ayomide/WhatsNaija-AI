"""
Debug script to see exactly where message processing fails
"""
import asyncio
import logging
from uuid import UUID
from agent import (
    build_system_prompt,
    format_conversation_history,
    generate_response,
    parse_actions
)
from database import (
    get_business_by_id,
    get_knowledge_base,
    get_conversation_history,
    save_message
)
from knowledge import build_knowledge_context
from whatsapp import send_message_with_retry
from config import settings

# Enable detailed logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

async def debug():
    business_id = UUID('a6567e4b-594a-400d-94e4-f4af0bfe3d56')
    conversation_id = UUID('9e800252-9755-4345-be7d-044246ecfaa7')
    customer_phone = '+2349168897258'
    customer_message = 'Do you have ankara dresses?'

    print("\n" + "="*60)
    print("STEP 1: Get business data")
    print("="*60)
    from database import supabase
    result = supabase.table('businesses').select('*').eq('id', str(business_id)).execute()
    business = result.data[0] if result.data else None
    print(f"Business: {business['name']}")

    print("\n" + "="*60)
    print("STEP 2: Get knowledge base")
    print("="*60)
    knowledge = get_knowledge_base(business_id)
    print(f"Products: {len(knowledge['products'])}")
    print(f"FAQs: {len(knowledge['faqs'])}")
    print(f"Policies: {len(knowledge['policies'])}")

    print("\n" + "="*60)
    print("STEP 3: Build knowledge context")
    print("="*60)
    knowledge_context = build_knowledge_context(knowledge)
    print("Products preview:", knowledge_context['products'][:100])

    print("\n" + "="*60)
    print("STEP 4: Build system prompt")
    print("="*60)
    system_prompt = build_system_prompt(business, knowledge_context)
    print(f"System prompt length: {len(system_prompt)} chars")

    print("\n" + "="*60)
    print("STEP 5: Get conversation history")
    print("="*60)
    history_messages = get_conversation_history(conversation_id, limit=10)
    conversation_history = format_conversation_history(history_messages)
    print(f"History messages: {len(conversation_history)}")

    print("\n" + "="*60)
    print("STEP 6: Generate AI response")
    print("="*60)
    print(f"Customer message: {customer_message}")

    response = await generate_response(
        conversation_history,
        system_prompt,
        customer_message
    )

    if response:
        print(f"\nAI Response: {response}")
        print(f"Response length: {len(response)} chars")
    else:
        print("\n❌ ERROR: No response from AI!")
        return

    print("\n" + "="*60)
    print("STEP 7: Parse actions")
    print("="*60)
    cleaned_response, actions = parse_actions(response)
    print(f"Cleaned response: {cleaned_response}")
    print(f"Actions: {actions}")

    print("\n" + "="*60)
    print("STEP 8: Send WhatsApp message")
    print("="*60)
    print(f"Sending to: {customer_phone}")
    print(f"Message: {cleaned_response}")

    success = await send_message_with_retry(
        phone_number_id=business['phone_number_id'],
        to=customer_phone,
        message=cleaned_response,
        access_token=settings.whatsapp_access_token
    )

    if success:
        print("✅ WhatsApp message sent successfully!")
    else:
        print("❌ Failed to send WhatsApp message")
        return

    print("\n" + "="*60)
    print("STEP 9: Save bot message to database")
    print("="*60)
    save_message(conversation_id, "bot", cleaned_response)
    print("✅ Bot message saved!")

    print("\n" + "="*60)
    print("✅ COMPLETE!")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(debug())
