"""
Send a test webhook to your local server
This simulates what Meta does when a message is received
"""
import httpx
import asyncio
import json

# Sample webhook payload from Meta
webhook_payload = {
    "object": "whatsapp_business_account",
    "entry": [{
        "id": "WABA_ID",
        "changes": [{
            "value": {
                "messaging_product": "whatsapp",
                "metadata": {
                    "display_phone_number": "15550000000",
                    "phone_number_id": "1019128617959246"
                },
                "contacts": [{
                    "profile": {
                        "name": "Test User"
                    },
                    "wa_id": "2348012345678"
                }],
                "messages": [{
                    "from": "2348012345678",
                    "id": "wamid.test123",
                    "timestamp": "1234567890",
                    "type": "text",
                    "text": {
                        "body": "Hi, do you have ankara dresses?"
                    }
                }]
            },
            "field": "messages"
        }]
    }]
}

async def test():
    print("Sending test webhook to http://localhost:8000/webhook")
    print("Payload:", json.dumps(webhook_payload, indent=2))
    print("\n" + "="*60)

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8000/webhook",
            json=webhook_payload
        )

        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {response.text}")
        print("="*60)
        print("\nCheck your backend logs above!")
        print("You should see message processing logs.")

if __name__ == "__main__":
    asyncio.run(test())
