"""
Force generate a bot response for the latest message
This bypasses the webhook and processes the message directly
"""
import asyncio
from uuid import UUID
from database import supabase, save_message
from agent import (
    build_system_prompt,
    format_conversation_history,
    generate_response,
    build_knowledge_context,
    get_business_by_id,
    get_knowledge_base,
    get_conversation_history
)
from whatsapp import send_message_with_retry
from config import settings

async def force_response():
    # Get the latest conversation
    convos = supabase.table('conversations').select('*').order('last_message_at', desc=True).limit(1).execute()
    if not convos.data:
        print("No conversations found!")
        return

    conversation = convos.data[0]
    conversation_id = UUID(conversation['id'])
    business_id = UUID(conversation['business_id'])
    customer_phone = conversation['customer_phone']

    print(f"Processing conversation: {conversation_id}")
    print(f"Customer: {customer_phone}")

    # Get business
    result = supabase.table('businesses').select('*').eq('id', str(business_id)).execute()
    business = result.data[0]
    print(f"Business: {business['name']}")

    # Get knowledge
    knowledge = get_knowledge_base(business_id)
    knowledge_context = build_knowledge_context(knowledge)

    # Build system prompt
    system_prompt = build_system_prompt(business, knowledge_context)

    # Get history
    history_messages = get_conversation_history(conversation_id, limit=10)
    conversation_history = format_conversation_history(history_messages)

    # Get latest customer message
    latest_msg = supabase.table('messages').select('*').eq('conversation_id', str(conversation_id)).eq('role', 'customer').order('sent_at', desc=True).limit(1).execute()

    if not latest_msg.data:
        print("No customer message found!")
        return

    customer_message = latest_msg.data[0]['content']
    print(f"\nCustomer said: {customer_message}")

    # Generate response
    print("\nGenerating AI response...")
    response = await generate_response(
        conversation_history,
        system_prompt,
        customer_message
    )

    if not response:
        print("ERROR: AI did not generate a response!")
        return

    print(f"\nBot response generated ({len(response)} chars)")

    # Send via WhatsApp
    print(f"\nSending to WhatsApp: {customer_phone}")
    success = await send_message_with_retry(
        phone_number_id=business['phone_number_id'],
        to=customer_phone,
        message=response,
        access_token=settings.whatsapp_access_token
    )

    if success:
        print("SUCCESS: WhatsApp message sent!")
        # Save to database
        save_message(conversation_id, "bot", response)
        print("SUCCESS: Bot message saved to database!")
        print("\nSUCCESS! Check your WhatsApp for the bot reply!")
    else:
        print("ERROR: Failed to send WhatsApp message")
        print("But the AI generated a response, so the AI works!")

if __name__ == "__main__":
    asyncio.run(force_response())
