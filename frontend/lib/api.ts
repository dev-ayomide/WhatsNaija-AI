/**
 * API client for communicating with the Python backend.
 * All requests include the user's Supabase JWT for server-side auth.
 */

import { supabase } from '@/lib/supabase';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

export async function sendWhatsAppMessage(
  businessId: string,
  customerPhone: string,
  message: string,
  conversationId?: string,
) {
  const response = await fetch(`${API_URL}/api/send-message`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({
      business_id: businessId,
      customer_phone: customerPhone,
      message,
      conversation_id: conversationId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return response.json();
}

export async function setConversationStatus(
  conversationId: string,
  status: 'bot' | 'human' | 'closed',
) {
  const response = await fetch(`${API_URL}/api/conversation-status`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ conversation_id: conversationId, status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update conversation status');
  }

  return response.json();
}

export async function generatePaymentLink(
  businessId: string,
  amount: number,
  customerPhone: string,
  description: string,
) {
  const response = await fetch(`${API_URL}/api/payment-link`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ business_id: businessId, amount, customer_phone: customerPhone, description }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate payment link');
  }

  return response.json();
}

export async function toggleBotStatus(businessId: string, isActive: boolean) {
  const response = await fetch(`${API_URL}/api/bot-status`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ business_id: businessId, is_active: isActive }),
  });

  if (!response.ok) {
    throw new Error('Failed to toggle bot status');
  }

  return response.json();
}
