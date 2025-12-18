-- =============================================
-- FRESH DATABASE CLEANUP SCRIPT
-- FlyCloth - Production Reset
-- =============================================
-- WARNING: This deletes ALL data including users!
-- Run this in Supabase SQL Editor to start fresh.
-- =============================================

-- 1. Disable the auto-profile trigger temporarily
-- (otherwise DELETE from auth.users will fail)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Delete all data in proper order (respecting foreign keys)
-- Order matters: children before parents

-- Product reviews (references products, profiles, orders)
DELETE FROM product_reviews;

-- Order items (references orders)
DELETE FROM order_items;

-- Orders (references profiles)
DELETE FROM orders;

-- Cart items (references profiles and variants)
DELETE FROM cart_items;

-- Product images (references products)
DELETE FROM product_images;

-- Product variants (references products)
DELETE FROM product_variants;

-- Products (references categories)
DELETE FROM products;

-- Categories (standalone)
DELETE FROM categories;

-- Profiles (references auth.users)
DELETE FROM profiles;

-- 3. Delete auth users (clears all user accounts)
-- This includes all authentication data
DELETE FROM auth.users;

-- 4. Re-create the auto-profile trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Verify cleanup
DO $$
DECLARE
  profile_count INTEGER;
  product_count INTEGER;
  order_count INTEGER;
  review_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM profiles;
  SELECT COUNT(*) INTO product_count FROM products;
  SELECT COUNT(*) INTO order_count FROM orders;
  SELECT COUNT(*) INTO review_count FROM product_reviews;
  
  RAISE NOTICE '=== CLEANUP COMPLETE ===';
  RAISE NOTICE 'Profiles: % (should be 0)', profile_count;
  RAISE NOTICE 'Products: % (should be 0)', product_count;
  RAISE NOTICE 'Orders: % (should be 0)', order_count;
  RAISE NOTICE 'Reviews: % (should be 0)', review_count;
  RAISE NOTICE '========================';
END $$;

-- =============================================
-- NEXT STEPS:
-- 1. Create a new admin user via Supabase Auth
-- 2. Run: UPDATE profiles SET role = 'admin' WHERE id = '<new-user-id>';
-- 3. Add products through the admin panel
-- =============================================
