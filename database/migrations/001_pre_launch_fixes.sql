-- WhatsNaija AI — Pre-Launch Schema Fixes
-- Run this entire script in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ============================================================
-- FIX 1: Make whatsapp_number nullable
-- (onboarding form sends null when owner skips the field)
-- ============================================================
ALTER TABLE businesses ALTER COLUMN whatsapp_number DROP NOT NULL;

-- Replace the unique index so NULL values don't conflict
DROP INDEX IF EXISTS idx_businesses_whatsapp_number;
CREATE UNIQUE INDEX idx_businesses_whatsapp_number
  ON businesses(whatsapp_number)
  WHERE whatsapp_number IS NOT NULL;


-- ============================================================
-- FIX 2: Add unique constraint on phone_number_id
-- (prevents two businesses routing on the same WhatsApp number)
-- ============================================================
ALTER TABLE businesses
  ADD CONSTRAINT businesses_phone_number_id_key UNIQUE (phone_number_id);


-- ============================================================
-- FIX 6: Add per-business WhatsApp access token
-- Each business has their own Meta WABA and access token.
-- Falls back to the platform .env token when NULL (dev mode).
-- ============================================================
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT;


-- ============================================================
-- FIX 3: Verify RLS is enabled on all tables
-- Run this SELECT after the above to confirm — every table
-- should show rowsecurity = true
-- ============================================================
SELECT
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- If any show false, enable with:
-- ALTER TABLE <tablename> ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- FIX 4: Check all RLS policies exist
-- ============================================================
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================
-- FIX 5: Ensure businesses has policies for anon/authenticated
-- (these may already exist from setup_final.sql — safe to re-run)
-- ============================================================

-- Businesses: owner can read/write only their own row
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'businesses' AND policyname = 'owners_manage_own_business'
  ) THEN
    CREATE POLICY owners_manage_own_business ON businesses
      FOR ALL
      USING (auth.uid() = owner_id)
      WITH CHECK (auth.uid() = owner_id);
  END IF;
END $$;

-- Conversations: owner can read conversations for their business
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'conversations' AND policyname = 'owners_view_conversations'
  ) THEN
    CREATE POLICY owners_view_conversations ON conversations
      FOR ALL
      USING (
        business_id IN (
          SELECT id FROM businesses WHERE owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Messages: owner can read messages in their conversations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'messages' AND policyname = 'owners_view_messages'
  ) THEN
    CREATE POLICY owners_view_messages ON messages
      FOR ALL
      USING (
        conversation_id IN (
          SELECT c.id FROM conversations c
          JOIN businesses b ON c.business_id = b.id
          WHERE b.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Leads: owner can manage their leads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'leads' AND policyname = 'owners_manage_leads'
  ) THEN
    CREATE POLICY owners_manage_leads ON leads
      FOR ALL
      USING (
        business_id IN (
          SELECT id FROM businesses WHERE owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Knowledge base: owner can manage their knowledge base
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'knowledge_base' AND policyname = 'owners_manage_knowledge'
  ) THEN
    CREATE POLICY owners_manage_knowledge ON knowledge_base
      FOR ALL
      USING (
        business_id IN (
          SELECT id FROM businesses WHERE owner_id = auth.uid()
        )
      )
      WITH CHECK (
        business_id IN (
          SELECT id FROM businesses WHERE owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Bookings: owner can manage their bookings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'bookings' AND policyname = 'owners_manage_bookings'
  ) THEN
    CREATE POLICY owners_manage_bookings ON bookings
      FOR ALL
      USING (
        business_id IN (
          SELECT id FROM businesses WHERE owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Enable RLS on all tables (safe to re-run)
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
