-- Fix: Update the business record with your actual phone_number_id
-- Run this in Supabase SQL Editor

-- First, let's see what's currently in the database
SELECT id, name, phone_number_id FROM businesses;

-- Update the business record with your actual WhatsApp phone_number_id
UPDATE businesses
SET phone_number_id = '1019128617959246'
WHERE name = 'Amara''s Boutique';  -- or use the business name you have

-- Verify the update
SELECT id, name, phone_number_id FROM businesses;

-- You should see phone_number_id now shows: 1019128617959246
