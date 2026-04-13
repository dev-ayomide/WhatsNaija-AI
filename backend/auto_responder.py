"""
Auto-Responder Service
Automatically processes new customer messages and sends bot replies
Run this in a separate terminal to make the bot work automatically
"""
import asyncio
import time
from datetime import datetime, timedelta, timezone
from uuid import UUID
from database import supabase, save_message
from agent import (
    build_system_prompt,
    format_conversation_history,
    generate_response,
    build_knowledge_context,
    get_knowledge_base,
    get_conversation_history
)
from whatsapp import send_message_with_retry
from config import settings

processed_message_ids = set()

async def process_pending_messages():
    """Check for customer messages that don't have bot replies yet"""

    # Get all active bot-mode conversations
    convos = supabase.table('conversations').select('*').eq('status', 'bot').execute()

    for convo in convos.data:
        conversation_id = convo['id']
        business_id = convo['business_id']
        customer_phone = convo['customer_phone']

        # Already filtered to bot-mode conversations in the query above

        # Get messages in this conversation
        msgs = supabase.table('messages').select('*').eq(
            'conversation_id', conversation_id
        ).order('sent_at', desc=True).limit(20).execute()

        if not msgs.data:
            continue

        # Check if latest message is from customer without a bot reply
        latest_msg = msgs.data[0]

        if latest_msg['role'] != 'customer':
            continue  # Already responded

        # Check if we already processed this message
        msg_id = latest_msg['id']
        if msg_id in processed_message_ids:
            continue

        # Guard: only process messages older than 8 seconds.
        # This gives the webhook background task time to run first,
        # preventing duplicate responses when both are running.
        try:
            msg_time = datetime.fromisoformat(latest_msg['sent_at'].replace('Z', '+00:00'))
            age_seconds = (datetime.now(timezone.utc) - msg_time).total_seconds()
            if age_seconds < 8:
                continue  # Too fresh — let webhook handle it
        except Exception:
            pass  # If we can't parse the timestamp, proceed anyway

        # Check if there's a bot message after this customer message
        customer_msg_time = latest_msg['sent_at']
        bot_replies = [m for m in msgs.data if m['role'] == 'bot' and m['sent_at'] > customer_msg_time]

        if bot_replies:
            processed_message_ids.add(msg_id)
            continue  # Already has a bot reply

        # This message needs a response!
        customer_message = latest_msg['content']

        print(f"\n[{datetime.now().strftime('%H:%M:%S')}] New message from {customer_phone}: {customer_message[:50]}...")

        try:
            # Get business
            biz_result = supabase.table('businesses').select('*').eq('id', business_id).execute()
            if not biz_result.data:
                print(f"  ERROR: Business {business_id} not found")
                processed_message_ids.add(msg_id)
                continue

            business = biz_result.data[0]

            # Get knowledge
            knowledge = get_knowledge_base(UUID(business_id))
            knowledge_context = build_knowledge_context(knowledge)

            # Build system prompt
            system_prompt = build_system_prompt(business, knowledge_context)

            # Get history
            history_messages = get_conversation_history(UUID(conversation_id), limit=10)
            conversation_history = format_conversation_history(history_messages)

            # Generate response
            print(f"  Generating AI response...")
            response = await generate_response(
                conversation_history,
                system_prompt,
                customer_message
            )

            if not response:
                print(f"  ERROR: No response generated")
                processed_message_ids.add(msg_id)
                continue

            print(f"  Response: {response[:60]}...")

            # Send via WhatsApp (use per-business token if set)
            print(f"  Sending to WhatsApp...")
            access_token = business.get('whatsapp_access_token') or settings.whatsapp_access_token
            success = await send_message_with_retry(
                phone_number_id=business['phone_number_id'],
                to=customer_phone,
                message=response,
                access_token=access_token
            )

            if success:
                # Save to database
                save_message(UUID(conversation_id), "bot", response)
                print(f"  SUCCESS! Bot reply sent and saved")
            else:
                print(f"  ERROR: Failed to send to WhatsApp")

            # Mark as processed
            processed_message_ids.add(msg_id)

        except Exception as e:
            print(f"  ERROR: {e}")
            processed_message_ids.add(msg_id)

async def main():
    print("="*60)
    print("WhatsNaija AI Auto-Responder")
    print("="*60)
    print("Monitoring for new messages...")
    print("Press Ctrl+C to stop")
    print("="*60 + "\n")

    while True:
        try:
            await process_pending_messages()
            await asyncio.sleep(3)  # Check every 3 seconds
        except KeyboardInterrupt:
            print("\n\nStopping auto-responder...")
            break
        except Exception as e:
            print(f"\nERROR in main loop: {e}")
            await asyncio.sleep(5)

if __name__ == "__main__":
    asyncio.run(main())
