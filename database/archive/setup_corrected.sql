-- Corrected Setup Script - Matches your actual database schema
-- Run this entire script in Supabase SQL Editor

DO $$
DECLARE
    user_uuid UUID;
    business_uuid UUID;
BEGIN
    -- Get the first user ID
    SELECT id INTO user_uuid FROM auth.users LIMIT 1;

    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'No user found! Please create a user first in Authentication > Users';
    END IF;

    -- Insert business with correct columns
    INSERT INTO businesses (
        name,
        whatsapp_number,
        phone_number_id,
        waba_id,
        business_type,
        tone_preference,
        owner_id,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        'Amara''s Boutique',
        '+2348012345678',           -- Placeholder WhatsApp number
        '1019128617959246',         -- Your actual WhatsApp phone_number_id from .env
        '965857209633940',          -- Your actual WABA_ID from .env
        'retail',
        'casual',
        user_uuid,
        true,
        NOW(),
        NOW()
    )
    RETURNING id INTO business_uuid;

    -- Add sample products (using correct schema)
    INSERT INTO knowledge_base (business_id, type, product_name, price, description, is_active, created_at, updated_at)
    VALUES
        (business_uuid, 'product', 'Ankara Maxi Dress', 15000, 'Beautiful ankara maxi dresses available in blue, wine, and olive green. Made from quality ankara fabric.', true, NOW(), NOW()),
        (business_uuid, 'product', 'Lace Gown', 25000, 'Elegant lace evening gowns. Available in black, gold, and silver. Perfect for special occasions.', true, NOW(), NOW()),
        (business_uuid, 'product', 'Casual T-Shirts', 5000, 'Comfortable cotton t-shirts in various colors and sizes.', true, NOW(), NOW());

    -- Add FAQs (using question/answer format)
    INSERT INTO knowledge_base (business_id, type, question, answer, is_active, created_at, updated_at)
    VALUES
        (business_uuid, 'faq', 'How much is shipping?', 'We offer delivery within Lagos (₦2,000) and nationwide shipping (₦3,500). Delivery takes 2-3 business days within Lagos and 5-7 days nationwide.', true, NOW(), NOW()),
        (business_uuid, 'faq', 'What payment methods do you accept?', 'We accept bank transfer, card payment via Paystack, and cash on delivery (Lagos only).', true, NOW(), NOW()),
        (business_uuid, 'faq', 'What is your returns policy?', 'We accept returns within 7 days if the item is unused and in original packaging. Customers pay for return shipping.', true, NOW(), NOW());

    -- Add business policies
    INSERT INTO knowledge_base (business_id, type, question, answer, is_active, created_at, updated_at)
    VALUES
        (business_uuid, 'policy', 'Business Hours', 'We are open Monday to Saturday, 9 AM to 6 PM. Closed on Sundays and public holidays.', true, NOW(), NOW()),
        (business_uuid, 'policy', 'Custom Orders', 'We accept custom dress orders! Send us your design and measurements. Custom orders take 2-3 weeks and require 50% deposit upfront.', true, NOW(), NOW());

    RAISE NOTICE 'Success! Business created with ID: %', business_uuid;
    RAISE NOTICE 'User ID: %', user_uuid;
    RAISE NOTICE 'Phone Number ID: 1019128617959246';
    RAISE NOTICE 'WABA ID: 965857209633940';
END $$;

-- Verify everything was created
SELECT
    'BUSINESS CREATED' as status,
    id,
    name,
    phone_number_id,
    waba_id,
    is_active
FROM businesses;

-- Check knowledge base
SELECT
    type,
    COALESCE(product_name, question) as item,
    COALESCE(price::text, '') as price,
    LEFT(COALESCE(description, answer), 60) || '...' as preview
FROM knowledge_base
WHERE business_id = (SELECT id FROM businesses ORDER BY created_at DESC LIMIT 1)
ORDER BY type, created_at;

-- Final success message
SELECT '✅ Setup complete! Your WhatsApp bot is ready!' as message;
