-- WhatsNaija AI Test Data
-- This creates a test business with sample products and FAQs for development
-- Run this AFTER schema.sql

-- ============================================================================
-- IMPORTANT: Update the owner_id below with your Supabase auth user ID
-- ============================================================================
-- How to get your user ID:
-- 1. Sign up in your Supabase app (or use Supabase Dashboard → Authentication → Users)
-- 2. Copy the user UUID from the auth.users table
-- 3. Replace 'YOUR_USER_ID_HERE' below with that UUID
-- ============================================================================

-- For development, we'll create a test business
-- You'll need to manually update the owner_id after creating a user

-- Test Business (Fashion Brand - "Amara's Boutique")
INSERT INTO businesses (
    id,
    owner_id,
    name,
    whatsapp_number,
    phone_number_id,
    waba_id,
    business_type,
    tone_preference,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000001',  -- Fixed UUID for testing
    'YOUR_USER_ID_HERE',                      -- REPLACE THIS with your Supabase user ID
    'Amara''s Boutique',
    '+2348012345678',                         -- Test WhatsApp number
    'TEST_PHONE_NUMBER_ID',                   -- Replace with real Phone Number ID from Meta
    'TEST_WABA_ID',                           -- Replace with real WABA ID from Meta
    'fashion',
    'casual',
    true
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- KNOWLEDGE BASE - PRODUCTS
-- ============================================================================

INSERT INTO knowledge_base (business_id, type, product_name, price, description, answer) VALUES
('00000000-0000-0000-0000-000000000001', 'product', 'Ankara Maxi Dress (Blue)', 15000, 'Beautiful blue ankara print maxi dress, perfect for events', 'Our blue ankara maxi dress is ₦15,000. It''s made from premium quality ankara fabric with a flowing maxi cut. Perfect for weddings, parties, and special occasions!'),
('00000000-0000-0000-0000-000000000001', 'product', 'Ankara Maxi Dress (Wine)', 15000, 'Wine-colored ankara print maxi dress', 'The wine ankara maxi dress costs ₦15,000. Same beautiful design as our blue dress, but in a rich wine color. Very elegant!'),
('00000000-0000-0000-0000-000000000001', 'product', 'Ankara Maxi Dress (Olive)', 15000, 'Olive green ankara print maxi dress', 'Our olive green ankara maxi dress is ₦15,000. Unique color that stands out at any event!'),
('00000000-0000-0000-0000-000000000001', 'product', 'Ankara Midi Skirt', 8500, 'Knee-length ankara skirt with elastic waist', 'Our ankara midi skirt is ₦8,500. It has an elastic waist for comfort and comes in multiple prints. Great for casual wear or office!'),
('00000000-0000-0000-0000-000000000001', 'product', 'Ankara Crop Top', 6000, 'Stylish ankara crop top with puff sleeves', 'The ankara crop top costs ₦6,000. It features trendy puff sleeves and can be paired with jeans or our midi skirt!'),
('00000000-0000-0000-0000-000000000001', 'product', 'Ankara Kimono Jacket', 12000, 'Flowing kimono-style jacket in ankara print', 'Our ankara kimono jacket is ₦12,000. Perfect for layering over any outfit. One size fits most!'),
('00000000-0000-0000-0000-000000000001', 'product', 'Aso-Oke Gele (Head Tie)', 5000, 'Pre-made aso-oke gele for easy wearing', 'Our aso-oke gele is ₦5,000. It''s already pleated and shaped, so you just wear it! Available in gold, purple, and coral.'),
('00000000-0000-0000-0000-000000000001', 'product', 'Beaded Necklace Set', 4500, 'Handmade beaded necklace with matching earrings', 'The beaded necklace set costs ₦4,500. Includes necklace and earrings. Perfect to complete your African outfit!');

-- ============================================================================
-- KNOWLEDGE BASE - FAQs
-- ============================================================================

INSERT INTO knowledge_base (business_id, type, question, answer) VALUES
('00000000-0000-0000-0000-000000000001', 'faq', 'Do you have ankara fabric?', 'Yes! We have ankara fabric in various prints and we also make ready-to-wear ankara pieces like dresses, skirts, crop tops, and kimono jackets.'),
('00000000-0000-0000-0000-000000000001', 'faq', 'What sizes do you have?', 'We make custom sizes! Just send us your measurements (bust, waist, hips, and length) and we''ll make it to fit you perfectly. We can do sizes UK 6 to UK 22.'),
('00000000-0000-0000-0000-000000000001', 'faq', 'How long does delivery take?', 'Delivery takes 3-5 business days within Lagos. For other states, it takes 5-7 business days. Express delivery (24 hours) is available for an extra ₦2,000.'),
('00000000-0000-0000-0000-000000000001', 'faq', 'Do you ship outside Lagos?', 'Yes! We ship to all states in Nigeria. Shipping fee depends on your location - usually ₦1,500-₦3,000.'),
('00000000-0000-0000-0000-000000000001', 'faq', 'Can I return an item?', 'Yes, you can return or exchange within 7 days if the item is unworn and still has tags. You''ll cover return shipping. Custom-made items cannot be returned unless there''s a defect.'),
('00000000-0000-0000-0000-000000000001', 'faq', 'Do you do custom designs?', 'Absolutely! Send us a picture of what you want or describe it, and we''ll give you a quote. Custom orders take 1-2 weeks depending on complexity.'),
('00000000-0000-0000-0000-000000000001', 'faq', 'What payment methods do you accept?', 'We accept bank transfer, card payment via Paystack, and payment on delivery (POD) for Lagos customers. I can send you a payment link for card payment!'),
('00000000-0000-0000-0000-000000000001', 'faq', 'How much is shipping?', 'Shipping within Lagos is ₦1,500. Outside Lagos, it''s ₦2,000-₦3,000 depending on your state. Free shipping on orders above ₦30,000!'),
('00000000-0000-0000-0000-000000000001', 'faq', 'Do you have a physical store?', 'We operate online but you can book an appointment to come see samples at our studio in Lekki, Lagos. Just let me know what day works for you!'),
('00000000-0000-0000-0000-000000000001', 'faq', 'Can I see more pictures?', 'Yes! Check our Instagram @amarasboutique or I can send you pictures via WhatsApp. What style are you interested in?');

-- ============================================================================
-- KNOWLEDGE BASE - POLICIES
-- ============================================================================

INSERT INTO knowledge_base (business_id, type, question, answer) VALUES
('00000000-0000-0000-0000-000000000001', 'policy', 'Payment Policy', 'We require 50% deposit for custom orders before we start production. Balance is paid before delivery. For ready-made items, full payment is required before shipping (except for POD in Lagos).'),
('00000000-0000-0000-0000-000000000001', 'policy', 'Refund Policy', 'Refunds are processed within 5-7 business days after we receive the returned item. Money will be sent back to your bank account.'),
('00000000-0000-0000-0000-000000000001', 'policy', 'Production Time', 'Ready-made items ship within 1-2 business days. Custom orders take 7-14 days depending on complexity. We''ll always confirm the timeline before you pay.');

-- ============================================================================
-- KNOWLEDGE BASE - GREETING
-- ============================================================================

INSERT INTO knowledge_base (business_id, type, question, answer) VALUES
('00000000-0000-0000-0000-000000000001', 'greeting', 'Welcome Message', 'Hello! Welcome to Amara''s Boutique! 👗 We specialize in beautiful ankara pieces - dresses, skirts, tops, and accessories. How can I help you today?');

-- ============================================================================
-- BUSINESS HOURS (For appointment booking)
-- ============================================================================

-- Monday to Friday: 9 AM - 6 PM
INSERT INTO business_hours (business_id, day_of_week, start_time, end_time) VALUES
('00000000-0000-0000-0000-000000000001', 1, '09:00', '18:00'),  -- Monday
('00000000-0000-0000-0000-000000000001', 2, '09:00', '18:00'),  -- Tuesday
('00000000-0000-0000-0000-000000000001', 3, '09:00', '18:00'),  -- Wednesday
('00000000-0000-0000-0000-000000000001', 4, '09:00', '18:00'),  -- Thursday
('00000000-0000-0000-0000-000000000001', 5, '09:00', '18:00');  -- Friday

-- Saturday: 10 AM - 4 PM
INSERT INTO business_hours (business_id, day_of_week, start_time, end_time) VALUES
('00000000-0000-0000-0000-000000000001', 6, '10:00', '16:00');  -- Saturday

-- ============================================================================
-- SAMPLE CONVERSATIONS (For testing dashboard)
-- ============================================================================

-- Sample Conversation 1: Successful lead
INSERT INTO conversations (id, business_id, customer_phone, customer_name, status, started_at, last_message_at) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '+2348098765432', 'Chidinma', 'bot', now() - interval '2 hours', now() - interval '30 minutes');

INSERT INTO messages (conversation_id, role, content, sent_at) VALUES
('10000000-0000-0000-0000-000000000001', 'customer', 'Hi, do you have ankara dresses?', now() - interval '2 hours'),
('10000000-0000-0000-0000-000000000001', 'bot', 'Hello! Welcome to Amara''s Boutique! 👗 Yes, we have beautiful ankara maxi dresses in blue, wine, and olive green. Each is ₦15,000. Which color catches your eye?', now() - interval '2 hours'),
('10000000-0000-0000-0000-000000000001', 'customer', 'The blue one sounds nice. How much again?', now() - interval '1 hour 50 minutes'),
('10000000-0000-0000-0000-000000000001', 'bot', 'The blue ankara maxi dress is ₦15,000. It''s made from premium ankara fabric with a flowing maxi cut, perfect for weddings and special events! Would you like to order?', now() - interval '1 hour 50 minutes'),
('10000000-0000-0000-0000-000000000001', 'customer', 'Yes please. My name is Chidinma', now() - interval '30 minutes'),
('10000000-0000-0000-0000-000000000001', 'bot', 'Great, Chidinma! I''ll need your measurements: bust, waist, hips, and your preferred length. Once you send those, I can create your payment link!', now() - interval '30 minutes');

-- Create lead for Chidinma
INSERT INTO leads (business_id, conversation_id, customer_name, customer_phone, product_interest, budget_range, status) VALUES
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Chidinma', '+2348098765432', 'Blue Ankara Maxi Dress', '₦15,000', 'new');

-- Sample Conversation 2: Just browsing
INSERT INTO conversations (id, business_id, customer_phone, status, started_at, last_message_at) VALUES
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '+2347012345678', 'bot', now() - interval '5 hours', now() - interval '5 hours');

INSERT INTO messages (conversation_id, role, content, sent_at) VALUES
('10000000-0000-0000-0000-000000000002', 'customer', 'How much is shipping to Abuja?', now() - interval '5 hours'),
('10000000-0000-0000-0000-000000000002', 'bot', 'Shipping to Abuja is ₦2,500 and takes 5-7 business days. We also offer express delivery (24 hours) for ₦4,500. Free shipping on orders above ₦30,000! Are you interested in any of our items?', now() - interval '5 hours');

-- Sample Conversation 3: Needs human help
INSERT INTO conversations (id, business_id, customer_phone, customer_name, status, started_at, last_message_at) VALUES
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '+2349087654321', 'Blessing', 'human', now() - interval '1 day', now() - interval '1 day');

INSERT INTO messages (conversation_id, role, content, sent_at) VALUES
('10000000-0000-0000-0000-000000000003', 'customer', 'I want a special wedding guest dress. Can you make it?', now() - interval '1 day'),
('10000000-0000-0000-0000-000000000003', 'bot', 'Absolutely! We do custom designs. Can you send me a picture of what you have in mind or describe the style you want? I''ll get you a quote!', now() - interval '1 day'),
('10000000-0000-0000-0000-000000000003', 'customer', 'Let me speak to the owner', now() - interval '1 day'),
('10000000-0000-0000-0000-000000000003', 'bot', 'No problem! Let me connect you with Amara. She''ll respond to you shortly!', now() - interval '1 day');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
    business_count INTEGER;
    knowledge_count INTEGER;
    conversation_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO business_count FROM businesses;
    SELECT COUNT(*) INTO knowledge_count FROM knowledge_base;
    SELECT COUNT(*) INTO conversation_count FROM conversations;

    RAISE NOTICE '✅ Seed data installed successfully!';
    RAISE NOTICE '   Businesses: %', business_count;
    RAISE NOTICE '   Knowledge base items: %', knowledge_count;
    RAISE NOTICE '   Sample conversations: %', conversation_count;
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT: Update the owner_id in the businesses table';
    RAISE NOTICE '   with your actual Supabase user ID from auth.users';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Test Business: Amara''s Boutique (Fashion)';
    RAISE NOTICE '   - 8 products (Ankara dresses, skirts, accessories)';
    RAISE NOTICE '   - 10 FAQs';
    RAISE NOTICE '   - 3 sample conversations';
END $$;
