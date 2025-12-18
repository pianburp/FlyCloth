-- =============================================
-- Row Level Security Policies
-- Production-Grade Architecture
-- =============================================
-- Best Practices Applied:
-- 1. Uses public.is_admin() helper function (cached per-transaction)
-- 2. Uses (SELECT auth.uid()) pattern to prevent per-row evaluation
-- 3. Single SELECT policy per table (no multiple_permissive_policies warning)
-- 4. Separate policies for INSERT/UPDATE/DELETE operations
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES POLICIES
-- =============================================
-- Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()));

-- Admins can read all profiles (for admin dashboard)
CREATE POLICY "profiles_select_admin"
  ON profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- =============================================
-- CATEGORIES POLICIES
-- =============================================
-- Anyone can read categories (public data)
CREATE POLICY "categories_select_all"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin write operations
CREATE POLICY "categories_insert_admin"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "categories_update_admin"
  ON categories FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "categories_delete_admin"
  ON categories FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================
-- PRODUCTS POLICIES
-- =============================================
-- Public users see only active products, admins see all
CREATE POLICY "products_select"
  ON products FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_admin());

-- Admin write operations
CREATE POLICY "products_insert_admin"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "products_update_admin"
  ON products FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "products_delete_admin"
  ON products FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================
-- PRODUCT VARIANTS POLICIES
-- =============================================
-- Public users see only active variants, admins see all
CREATE POLICY "variants_select"
  ON product_variants FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_admin());

-- Admin write operations
CREATE POLICY "variants_insert_admin"
  ON product_variants FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "variants_update_admin"
  ON product_variants FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "variants_delete_admin"
  ON product_variants FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================
-- PRODUCT IMAGES POLICIES
-- =============================================
-- Anyone can read product images (public data)
CREATE POLICY "images_select_all"
  ON product_images FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin write operations
CREATE POLICY "images_insert_admin"
  ON product_images FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "images_update_admin"
  ON product_images FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "images_delete_admin"
  ON product_images FOR DELETE
  TO authenticated
  USING (public.is_admin());



-- =============================================
-- CART ITEMS POLICIES
-- =============================================
-- Users can only access their own cart
CREATE POLICY "cart_select_own"
  ON cart_items FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "cart_insert_own"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "cart_update_own"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "cart_delete_own"
  ON cart_items FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- =============================================
-- ORDERS POLICIES
-- =============================================
-- Users see their own orders, admins see all
CREATE POLICY "orders_select"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin());

-- Users can create their own orders
CREATE POLICY "orders_insert_own"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Only admins can update orders (status changes, etc.)
CREATE POLICY "orders_update_admin"
  ON orders FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- =============================================
-- ORDER ITEMS POLICIES
-- =============================================
-- Users see their own order items, admins see all
CREATE POLICY "order_items_select"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = (SELECT auth.uid())
    )
    OR public.is_admin()
  );

-- Users can insert items for their own orders
CREATE POLICY "order_items_insert_own"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = (SELECT auth.uid())
    )
  );

-- =============================================
-- PRODUCT REVIEWS POLICIES
-- =============================================
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews (public data for product pages)
CREATE POLICY "reviews_select_all"
  ON product_reviews FOR SELECT
  TO anon, authenticated
  USING (true);

-- Users can insert reviews for their own delivered orders
CREATE POLICY "reviews_insert_own"
  ON product_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_id 
      AND orders.user_id = (SELECT auth.uid())
      AND orders.status = 'delivered'
    )
  );

-- Users can update their own reviews
CREATE POLICY "reviews_update_own"
  ON product_reviews FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Users can delete their own reviews
CREATE POLICY "reviews_delete_own"
  ON product_reviews FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- NOTE: Admins intentionally have NO write access to reviews for authenticity

-- =============================================
-- GRANT PERMISSIONS
-- =============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON categories, products, product_variants, product_images, product_reviews TO anon;
GRANT ALL ON profiles, cart_items, orders, order_items, product_reviews TO authenticated;
GRANT ALL ON categories, products, product_variants, product_images TO authenticated;

