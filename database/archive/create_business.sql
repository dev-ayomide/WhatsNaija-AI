-- Create a business record for your WhatsApp bot
-- Run this in Supabase SQL Editor

-- First, get your user ID from the auth.users table
-- You'll need this to set as the owner_id
SELECT id, email FROM auth.users LIMIT 1;

-- IMPORTANT: Copy the 'id' from the result above, then update the INSERT below

-- Insert your business with the correct phone_number_id
INSERT INTO businesses (
    name,
    business_type,
    phone_number_id,
    owner_id,
    tone_preference,
    auto_reply_enabled,
    created_at,
    updated_at
) VALUES (
    'Amara''s Boutique',                    -- Your business name
    'retail',                                -- Business type
    '1019128617959246',                      -- Your WhatsApp phone_number_id from .env
    'YOUR_USER_ID_HERE',                     -- Replace with the ID from the SELECT above
    'casual',                                -- Tone: casual, formal, or pidgin
    true,                                    -- Auto-reply enabled
    NOW(),
    NOW()
);

-- Verify the business was created
SELECT id, name, phone_number_id, owner_id FROM businesses;

-- The result should show your business with phone_number_id: 1019128617959246
