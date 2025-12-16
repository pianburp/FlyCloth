-- =============================================
-- Fix RLS Performance Warnings
-- 1. auth_rls_initplan: Wrap auth.<function>() in (select ...) to prevent re-evaluation per row
-- 2. multiple_permissive_policies: Consolidate duplicate SELECT policies
-- https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan
-- https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies
-- =============================================

-- =============================================
-- DROP ALL EXISTING POLICIES (clean slate)
-- =============================================

-- profiles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- categories
DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
DROP POLICY IF EXISTS "Admin can manage categories" ON categories;

-- products
DROP POLICY IF EXISTS "Anyone can read active products" ON products;
DROP POLICY IF EXISTS "Admin can read all products" ON products;
DROP POLICY IF EXISTS "Admin can manage products" ON products;

-- product_variants
DROP POLICY IF EXISTS "Anyone can read active variants" ON product_variants;
DROP POLICY IF EXISTS "Admin can manage variants" ON product_variants;

-- product_images
DROP POLICY IF EXISTS "Anyone can read images" ON product_images;
DROP POLICY IF EXISTS "Admin can manage images" ON product_images;

-- coupons
DROP POLICY IF EXISTS "Anyone can read active coupons" ON coupons;
DROP POLICY IF EXISTS "Admin can manage coupons" ON coupons;

-- cart_items
DROP POLICY IF EXISTS "Users can read own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can add to own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can delete from own cart" ON cart_items;

-- orders
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Admin can read all orders" ON orders;
DROP POLICY IF EXISTS "Admin can update orders" ON orders;

-- order_items
DROP POLICY IF EXISTS "Users can read own order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;
DROP POLICY IF EXISTS "Admin can read all order items" ON order_items;

-- =============================================
-- RECREATE POLICIES WITH FIXES
-- 1. auth.uid() wrapped in (select auth.uid())
-- 2. Consolidated SELECT policies to avoid multiple_permissive_policies
-- =============================================

-- =============================================
-- PROFILES POLICIES
-- =============================================
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()));

-- =============================================
-- CATEGORIES POLICIES
-- Consolidated: Single SELECT policy with OR condition
-- =============================================
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin write operations (INSERT, UPDATE, DELETE only - not SELECT to avoid duplicate)
CREATE POLICY "Admin can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');

CREATE POLICY "Admin can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');

CREATE POLICY "Admin can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');

-- =============================================
-- PRODUCTS POLICIES
-- Consolidated: Single SELECT policy for all users
-- =============================================
CREATE POLICY "Users can read products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
  );

-- Admin write operations
CREATE POLICY "Admin can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');

CREATE POLICY "Admin can update products"
  ON products FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');

CREATE POLICY "Admin can delete products"
  ON products FOR DELETE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');

-- =============================================
-- PRODUCT VARIANTS POLICIES
-- Consolidated: Single SELECT policy
-- =============================================
CREATE POLICY "Users can read variants"
  ON product_variants FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
  );

-- Admin write operations
CREATE POLICY "Admin can insert variants"
  ON product_variants FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');

CREATE POLICY "Admin can update variants"
  ON product_variants FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');

CREATE POLICY "Admin can delete variants"
  ON product_variants FOR DELETE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');

-- =============================================
-- PRODUCT IMAGES POLICIES
-- Consolidated: Single SELECT policy
-- =============================================
CREATE POLICY "Users can read images"
  ON product_images FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin write operations
CREATE POLICY "Admin can insert images"
  ON product_images FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');

CREATE POLICY "Admin can update images"
  ON product_images FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');

CREATE POLICY "Admin can delete images"
  ON product_images FOR DELETE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');

-- =============================================
-- COUPONS POLICIES
-- Consolidated: Single SELECT policy
-- =============================================
CREATE POLICY "Users can read coupons"
  ON coupons FOR SELECT
  TO anon, authenticated
  USING (
    (is_active = true AND (expires_at IS NULL OR expires_at > NOW()))
    OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
  );

-- Admin write operations
CREATE POLICY "Admin can insert coupons"
  ON coupons FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');

CREATE POLICY "Admin can update coupons"
  ON coupons FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');

CREATE POLICY "Admin can delete coupons"
  ON coupons FOR DELETE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');

-- =============================================
-- CART ITEMS POLICIES
-- Fixed: auth.uid() wrapped in (select ...)
-- =============================================
CREATE POLICY "Users can read own cart"
  ON cart_items FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can add to own cart"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own cart"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can delete from own cart"
  ON cart_items FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =============================================
-- ORDERS POLICIES
-- Consolidated: Single SELECT policy
-- Fixed: auth.uid() wrapped in (select ...)
-- =============================================
CREATE POLICY "Users can read orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
  );

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Admin can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');

-- =============================================
-- ORDER ITEMS POLICIES
-- Consolidated: Single SELECT policy
-- Fixed: auth.uid() wrapped in (select ...)
-- =============================================
CREATE POLICY "Users can read order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = (select auth.uid()))
    OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
  );

CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = (select auth.uid()))
  );
