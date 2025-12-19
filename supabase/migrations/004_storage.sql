-- =============================================
-- FlyCloth Storage Configuration
-- =============================================
-- Storage bucket and policies for product images/videos.
-- Run AFTER 001_schema.sql
-- =============================================

-- Create storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- STORAGE POLICIES
-- =============================================

-- Anyone can view product images
CREATE POLICY "storage_images_select_all"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'product-images');

-- Admin can upload product images
CREATE POLICY "storage_images_insert_admin"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

-- Admin can update product images
CREATE POLICY "storage_images_update_admin"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());

-- Admin can delete product images
CREATE POLICY "storage_images_delete_admin"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());
