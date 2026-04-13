import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Business = {
  id: string;
  owner_id: string;
  name: string;
  whatsapp_number: string | null;
  phone_number_id: string;
  waba_id: string;
  whatsapp_access_token: string | null;
  paystack_secret: string | null;
  business_type: string;
  tone_preference: 'formal' | 'casual' | 'pidgin';
  is_active: boolean;
  created_at: string;
};

export type Conversation = {
  id: string;
  business_id: string;
  customer_phone: string;
  customer_name: string | null;
  status: 'bot' | 'human' | 'closed';
  started_at: string;
  last_message_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  role: 'customer' | 'bot' | 'owner';
  content: string;
  wa_message_id: string | null;
  sent_at: string;
};

export type Lead = {
  id: string;
  business_id: string;
  conversation_id: string;
  customer_name: string | null;
  customer_phone: string;
  product_interest: string | null;
  budget_range: string | null;
  timeline: string | null;
  status: 'new' | 'contacted' | 'converted' | 'lost';
  captured_at: string;
};

export type PaymentLink = {
  id: string;
  business_id: string;
  conversation_id: string;
  paystack_ref: string;
  amount: number;
  customer_phone: string | null;
  status: 'sent' | 'clicked' | 'paid';
  created_at: string;
};

export type Booking = {
  id: string;
  business_id: string;
  conversation_id: string;
  customer_name: string | null;
  customer_phone: string;
  service: string | null;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
};

export type KnowledgeBase = {
  id: string;
  business_id: string;
  type: 'product' | 'faq' | 'policy' | 'greeting';
  question: string | null;
  answer: string;
  product_name: string | null;
  price: number | null;
  is_active: boolean;
  created_at: string;
};
