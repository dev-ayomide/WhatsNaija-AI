-- Quick Setup: Create business record with your WhatsApp credentials
-- Run this entire script in Supabase SQL Editor

-- This will automatically use the first user in your system as the owner
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

    -- Insert business
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
        'Amara''s Boutique',
        'retail',
        '1019128617959246',  -- Your actual WhatsApp phone_number_id
        user_uuid,
        'casual',
        true,
        NOW(),
        NOW()
    )
    RETURNING id INTO business_uuid;

    -- Add some sample products
    INSERT INTO knowledge_base (business_id, type, title, content, is_active, created_at, updated_at)
    VALUES
        (business_uuid, 'product', 'Ankara Maxi Dress', 'Beautiful ankara maxi dresses available in blue, wine, and olive green. Price: ₦15,000 each. Made from quality ankara fabric.', true, NOW(), NOW()),
        (business_uuid, 'product', 'Lace Gown', 'Elegant lace evening gowns. Available in black, gold, and silver. Price: ₦25,000. Perfect for special occasions.', true, NOW(), NOW()),
        (business_uuid, 'product', 'Casual T-Shirts', 'Comfortable cotton t-shirts in various colors and sizes. Price: ₦5,000 each.', true, NOW(), NOW()),
        (business_uuid, 'faq', 'Shipping', 'We offer delivery within Lagos (₦2,000) and nationwide shipping (₦3,500). Delivery takes 2-3 business days within Lagos and 5-7 days nationwide.', true, NOW(), NOW()),
        (business_uuid, 'faq', 'Payment Methods', 'We accept bank transfer, card payment via Paystack, and cash on delivery (Lagos only).', true, NOW(), NOW()),
        (business_uuid, 'faq', 'Returns Policy', 'We accept returns within 7 days if the item is unused and in original packaging. Customers pay for return shipping.', true, NOW(), NOW()),
        (business_uuid, 'policy', 'Business Hours', 'We are open Monday to Saturday, 9 AM to 6 PM. Closed on Sundays and public holidays.', true, NOW(), NOW()),
        (business_uuid, 'policy', 'Custom Orders', 'We accept custom dress orders! Send us your design and measurements. Custom orders take 2-3 weeks and require 50% deposit upfront.', true, NOW(), NOW());

    RAISE NOTICE 'Success! Business created with ID: %', business_uuid;
    RAISE NOTICE 'User ID: %', user_uuid;
    RAISE NOTICE 'Phone Number ID: 1019128617959246';
END $$;

-- Verify everything was created
SELECT 'Business:' as type, id, name, phone_number_id FROM businesses
UNION ALL
SELECT 'User:' as type, id::text, email, '' FROM auth.users LIMIT 1;

-- Check knowledge base
SELECT
    type,
    title,
    LEFT(content, 50) || '...' as preview
FROM knowledge_base
WHERE business_id = (SELECT id FROM businesses LIMIT 1);

-- Success message
SELECT '✅ Setup complete! Your business is ready to receive WhatsApp messages!' as status;
