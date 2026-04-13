"""
Quick test to see if AI response generation works
"""
import asyncio
from agent import build_system_prompt, generate_response, build_knowledge_context
from database import get_business_by_id, get_knowledge_base
from uuid import UUID

async def test():
    # Get the business
    business_id = UUID('a6567e4b-594a-400d-94e4-f4af0bfe3d56')

    print("Getting business...")
    from database import supabase
    result = supabase.table('businesses').select('*').eq('id', str(business_id)).execute()
    business = result.data[0] if result.data else None

    if not business:
        print("ERROR: Business not found!")
        return

    print(f"Business: {business['name']}")

    # Get knowledge base
    print("\nGetting knowledge base...")
    knowledge_result = supabase.table('knowledge_base').select('*').eq('business_id', str(business_id)).execute()
    knowledge = knowledge_result.data
    print(f"Found {len(knowledge)} knowledge base items")

    # Build knowledge context
    print("\nBuilding knowledge context...")
    from knowledge import build_knowledge_context
    knowledge_context = build_knowledge_context(knowledge)

    print("\nProducts:")
    print(knowledge_context.get('products', 'None')[:200])

    # Build system prompt
    print("\nBuilding system prompt...")
    system_prompt = build_system_prompt(business, knowledge_context)
    print("System prompt length:", len(system_prompt))

    # Test AI response
    print("\n" + "="*60)
    print("Testing AI response...")
    print("="*60)

    customer_message = "Hi, do you have ankara dresses?"
    print(f"\nCustomer: {customer_message}")

    response = await generate_response(
        conversation_history=[],
        system_prompt=system_prompt,
        customer_message=customer_message
    )

    if response:
        print(f"\nBot: {response}")
        print("\nSUCCESS! AI is working!")
    else:
        print("\nERROR: No response from AI")

if __name__ == "__main__":
    asyncio.run(test())
