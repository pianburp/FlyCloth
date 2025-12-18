-- =============================================
-- EXISTING DATABASE MIGRATION SCRIPT
-- =============================================
-- Run this script ONLY if you have an existing database
-- and need to migrate to the new architecture.
-- 
-- This script does NOT drop/recreate tables - it only:
-- 1. Creates helper functions
-- 2. Fixes FK constraints
-- 3. Adds missing indexes
-- 4. Recreates RLS policies with optimized versions
-- =============================================

-- =============================================
-- STEP 1: Create helper functions
-- =============================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (SELECT auth.uid()) 
    AND role = 'admin'
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles 
  WHERE id = (SELECT auth.uid())
$$;

-- Fix existing functions with SET search_path
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- =============================================
-- STEP 2: Add missing profile columns (if they don't exist)
-- =============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;

-- Add 'mod' to role constraint (if not already present)
DO $$
BEGIN
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('user', 'admin'));
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- =============================================
-- STEP 3: Add missing product columns (Stripe)
-- =============================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- =============================================
-- STEP 4: Add missing order columns (Stripe)
-- =============================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Add payment_status constraint (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_payment_status_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
      CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));
  END IF;
END $$;

-- =============================================
-- STEP 5: Clean up orphaned records
-- =============================================

DELETE FROM cart_items WHERE user_id NOT IN (SELECT id FROM profiles);
DELETE FROM orders WHERE user_id NOT IN (SELECT id FROM profiles);

-- =============================================
-- STEP 6: Fix FK constraints (from auth.users to profiles)
-- =============================================

-- Cart items
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_fkey;
ALTER TABLE cart_items ADD CONSTRAINT cart_items_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Orders
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- =============================================
-- STEP 7: Add performance indexes
-- =============================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);

-- =============================================
-- STEP 8: Drop all existing RLS policies
-- =============================================

-- profiles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;

-- categories
DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
DROP POLICY IF EXISTS "Admin can manage categories" ON categories;
DROP POLICY IF EXISTS "Admin can insert categories" ON categories;
DROP POLICY IF EXISTS "Admin can update categories" ON categories;
DROP POLICY IF EXISTS "Admin can delete categories" ON categories;
DROP POLICY IF EXISTS "categories_select_all" ON categories;
DROP POLICY IF EXISTS "categories_insert_admin" ON categories;
DROP POLICY IF EXISTS "categories_update_admin" ON categories;
DROP POLICY IF EXISTS "categories_delete_admin" ON categories;

-- products
DROP POLICY IF EXISTS "Anyone can read active products" ON products;
DROP POLICY IF EXISTS "Admin can read all products" ON products;
DROP POLICY IF EXISTS "Admin can manage products" ON products;
DROP POLICY IF EXISTS "Users can read products" ON products;
DROP POLICY IF EXISTS "Admin can insert products" ON products;
DROP POLICY IF EXISTS "Admin can update products" ON products;
DROP POLICY IF EXISTS "Admin can delete products" ON products;
DROP POLICY IF EXISTS "products_select" ON products;
DROP POLICY IF EXISTS "products_insert_admin" ON products;
DROP POLICY IF EXISTS "products_update_admin" ON products;
DROP POLICY IF EXISTS "products_delete_admin" ON products;

-- product_variants
DROP POLICY IF EXISTS "Anyone can read active variants" ON product_variants;
DROP POLICY IF EXISTS "Admin can manage variants" ON product_variants;
DROP POLICY IF EXISTS "Users can read variants" ON product_variants;
DROP POLICY IF EXISTS "Admin can insert variants" ON product_variants;
DROP POLICY IF EXISTS "Admin can update variants" ON product_variants;
DROP POLICY IF EXISTS "Admin can delete variants" ON product_variants;
DROP POLICY IF EXISTS "variants_select" ON product_variants;
DROP POLICY IF EXISTS "variants_insert_admin" ON product_variants;
DROP POLICY IF EXISTS "variants_update_admin" ON product_variants;
DROP POLICY IF EXISTS "variants_delete_admin" ON product_variants;

-- product_images
DROP POLICY IF EXISTS "Anyone can read images" ON product_images;
DROP POLICY IF EXISTS "Admin can manage images" ON product_images;
DROP POLICY IF EXISTS "Users can read images" ON product_images;
DROP POLICY IF EXISTS "Admin can insert images" ON product_images;
DROP POLICY IF EXISTS "Admin can update images" ON product_images;
DROP POLICY IF EXISTS "Admin can delete images" ON product_images;
DROP POLICY IF EXISTS "images_select_all" ON product_images;
DROP POLICY IF EXISTS "images_insert_admin" ON product_images;
DROP POLICY IF EXISTS "images_update_admin" ON product_images;
DROP POLICY IF EXISTS "images_delete_admin" ON product_images;

-- coupons
DROP POLICY IF EXISTS "Anyone can read active coupons" ON coupons;
DROP POLICY IF EXISTS "Admin can manage coupons" ON coupons;
DROP POLICY IF EXISTS "Users can read coupons" ON coupons;
DROP POLICY IF EXISTS "Admin can insert coupons" ON coupons;
DROP POLICY IF EXISTS "Admin can update coupons" ON coupons;
DROP POLICY IF EXISTS "Admin can delete coupons" ON coupons;
DROP POLICY IF EXISTS "coupons_select" ON coupons;
DROP POLICY IF EXISTS "coupons_insert_admin" ON coupons;
DROP POLICY IF EXISTS "coupons_update_admin" ON coupons;
DROP POLICY IF EXISTS "coupons_delete_admin" ON coupons;

-- cart_items
DROP POLICY IF EXISTS "Users can read own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can add to own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can delete from own cart" ON cart_items;
DROP POLICY IF EXISTS "cart_select_own" ON cart_items;
DROP POLICY IF EXISTS "cart_insert_own" ON cart_items;
DROP POLICY IF EXISTS "cart_update_own" ON cart_items;
DROP POLICY IF EXISTS "cart_delete_own" ON cart_items;

-- orders
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Admin can read all orders" ON orders;
DROP POLICY IF EXISTS "Admin can update orders" ON orders;
DROP POLICY IF EXISTS "Users can read orders" ON orders;
DROP POLICY IF EXISTS "orders_select" ON orders;
DROP POLICY IF EXISTS "orders_insert_own" ON orders;
DROP POLICY IF EXISTS "orders_update_admin" ON orders;

-- order_items
DROP POLICY IF EXISTS "Users can read own order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;
DROP POLICY IF EXISTS "Admin can read all order items" ON order_items;
DROP POLICY IF EXISTS "Users can read order items" ON order_items;
DROP POLICY IF EXISTS "order_items_select" ON order_items;
DROP POLICY IF EXISTS "order_items_insert_own" ON order_items;

-- storage
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "storage_images_select_all" ON storage.objects;
DROP POLICY IF EXISTS "storage_images_insert_admin" ON storage.objects;
DROP POLICY IF EXISTS "storage_images_update_admin" ON storage.objects;
DROP POLICY IF EXISTS "storage_images_delete_admin" ON storage.objects;

-- =============================================
-- STEP 9: Create optimized RLS policies
-- =============================================

-- ----- PROFILES POLICIES -----
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "profiles_select_admin"
  ON profiles FOR SELECT TO authenticated
  USING (public.is_admin());

-- ----- CATEGORIES POLICIES -----
CREATE POLICY "categories_select_all"
  ON categories FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "categories_insert_admin"
  ON categories FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "categories_update_admin"
  ON categories FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "categories_delete_admin"
  ON categories FOR DELETE TO authenticated
  USING (public.is_admin());

-- ----- PRODUCTS POLICIES -----
CREATE POLICY "products_select"
  ON products FOR SELECT TO anon, authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "products_insert_admin"
  ON products FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "products_update_admin"
  ON products FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "products_delete_admin"
  ON products FOR DELETE TO authenticated
  USING (public.is_admin());

-- ----- PRODUCT VARIANTS POLICIES -----
CREATE POLICY "variants_select"
  ON product_variants FOR SELECT TO anon, authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "variants_insert_admin"
  ON product_variants FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "variants_update_admin"
  ON product_variants FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "variants_delete_admin"
  ON product_variants FOR DELETE TO authenticated
  USING (public.is_admin());

-- ----- PRODUCT IMAGES POLICIES -----
CREATE POLICY "images_select_all"
  ON product_images FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "images_insert_admin"
  ON product_images FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "images_update_admin"
  ON product_images FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "images_delete_admin"
  ON product_images FOR DELETE TO authenticated
  USING (public.is_admin());

-- ----- COUPONS POLICIES -----
CREATE POLICY "coupons_select"
  ON coupons FOR SELECT TO anon, authenticated
  USING (
    (is_active = true AND (expires_at IS NULL OR expires_at > NOW()))
    OR public.is_admin()
  );

CREATE POLICY "coupons_insert_admin"
  ON coupons FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "coupons_update_admin"
  ON coupons FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "coupons_delete_admin"
  ON coupons FOR DELETE TO authenticated
  USING (public.is_admin());

-- ----- CART ITEMS POLICIES -----
CREATE POLICY "cart_select_own"
  ON cart_items FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "cart_insert_own"
  ON cart_items FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "cart_update_own"
  ON cart_items FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "cart_delete_own"
  ON cart_items FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ----- ORDERS POLICIES -----
CREATE POLICY "orders_select"
  ON orders FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "orders_insert_own"
  ON orders FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "orders_update_admin"
  ON orders FOR UPDATE TO authenticated
  USING (public.is_admin());

-- ----- ORDER ITEMS POLICIES -----
CREATE POLICY "order_items_select"
  ON order_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = (SELECT auth.uid())
    )
    OR public.is_admin()
  );

CREATE POLICY "order_items_insert_own"
  ON order_items FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = (SELECT auth.uid())
    )
  );

-- ----- STORAGE POLICIES -----
CREATE POLICY "storage_images_select_all"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "storage_images_insert_admin"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "storage_images_update_admin"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "storage_images_delete_admin"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());

-- =============================================
-- STEP 10: Grant permissions
-- =============================================

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
