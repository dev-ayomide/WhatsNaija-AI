"""
Knowledge base formatting for AI agent system prompts.
Converts database knowledge into formatted text for Claude.
"""

from typing import Dict, List, Any


def format_products_list(products: List[Dict[str, Any]]) -> str:
    """
    Format products into a readable list for the system prompt.

    Args:
        products: List of product dicts from knowledge_base table

    Returns:
        Formatted string of products
    """
    if not products:
        return "No products available."

    formatted = []
    for product in products:
        name = product.get("product_name", "Unknown Product")
        price = product.get("price")
        description = product.get("description", "")

        # Format price
        price_str = f"₦{price:,.0f}" if price else "Price on request"

        # Build product line
        product_line = f"- {name}: {price_str}"
        if description:
            product_line += f" — {description}"

        formatted.append(product_line)

    return "\n".join(formatted)


def format_faqs_list(faqs: List[Dict[str, Any]]) -> str:
    """
    Format FAQs into Q&A format for the system prompt.

    Args:
        faqs: List of FAQ dicts from knowledge_base table

    Returns:
        Formatted string of FAQs
    """
    if not faqs:
        return "No FAQs available."

    formatted = []
    for faq in faqs:
        question = faq.get("question", "")
        answer = faq.get("answer", "")

        if question and answer:
            formatted.append(f"Q: {question}\nA: {answer}\n")

    return "\n".join(formatted)


def format_policies_list(policies: List[Dict[str, Any]]) -> str:
    """
    Format policies into a list for the system prompt.

    Args:
        policies: List of policy dicts from knowledge_base table

    Returns:
        Formatted string of policies
    """
    if not policies:
        return "No specific policies."

    formatted = []
    for policy in policies:
        question = policy.get("question", "Policy")
        answer = policy.get("answer", "")

        formatted.append(f"**{question}**: {answer}")

    return "\n".join(formatted)


def get_greeting_message(greetings: List[Dict[str, Any]]) -> str:
    """
    Get the greeting message for new conversations.

    Args:
        greetings: List of greeting dicts from knowledge_base table

    Returns:
        Greeting message or default
    """
    if greetings and len(greetings) > 0:
        return greetings[0].get("answer", "Hello! How can I help you today?")

    return "Hello! How can I help you today?"


def build_knowledge_context(knowledge: Dict[str, List[Dict[str, Any]]]) -> Dict[str, str]:
    """
    Build formatted knowledge context for the agent.

    Args:
        knowledge: Dict with products, faqs, policies, greetings lists

    Returns:
        Dict with formatted strings for each category
    """
    return {
        "products": format_products_list(knowledge.get("products", [])),
        "faqs": format_faqs_list(knowledge.get("faqs", [])),
        "policies": format_policies_list(knowledge.get("policies", [])),
        "greeting": get_greeting_message(knowledge.get("greetings", []))
    }
