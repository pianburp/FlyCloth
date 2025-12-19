-- =============================================
-- FlyCloth RLS Policies (Consolidated Reference)
-- =============================================
-- Row Level Security policies for all tables.
-- Run AFTER 001_schema.sql
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES POLICIES
-- =============================================

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "profiles_select_admin"
  ON profiles FOR SELECT TO authenticated
  USING (public.is_admin());

-- =============================================
-- PRODUCTS POLICIES
-- =============================================

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

-- =============================================
-- PRODUCT VARIANTS POLICIES
-- =============================================

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

-- =============================================
-- PRODUCT IMAGES POLICIES
-- =============================================

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

-- =============================================
-- CART ITEMS POLICIES
-- =============================================

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

-- =============================================
-- ORDERS POLICIES
-- =============================================

CREATE POLICY "orders_select"
  ON orders FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "orders_insert_own"
  ON orders FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "orders_update_admin"
  ON orders FOR UPDATE TO authenticated
  USING (public.is_admin());

-- =============================================
-- ORDER ITEMS POLICIES
-- =============================================

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

-- =============================================
-- PRODUCT REVIEWS POLICIES
-- =============================================

CREATE POLICY "reviews_select_all"
  ON product_reviews FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "reviews_insert_own"
  ON product_reviews FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "reviews_update_own"
  ON product_reviews FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "reviews_delete_own"
  ON product_reviews FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin());
