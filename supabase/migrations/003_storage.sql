-- =============================================
-- Storage Bucket for Product Images
-- Production-Grade Architecture
-- =============================================
-- Best Practices Applied:
-- 1. Uses public.is_admin() helper function
-- 2. Uses (SELECT auth.uid()) pattern
-- =============================================

-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- Storage Policies
-- =============================================

-- Anyone can view product images (public bucket)
CREATE POLICY "storage_images_select_all"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images');

-- Admin can upload product images
CREATE POLICY "storage_images_insert_admin"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' 
    AND public.is_admin()
  );

-- Admin can update product images
CREATE POLICY "storage_images_update_admin"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images' 
    AND public.is_admin()
  );

-- Admin can delete product images
CREATE POLICY "storage_images_delete_admin"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images' 
    AND public.is_admin()
  );
