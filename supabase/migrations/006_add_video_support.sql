-- =============================================
-- Add Video Support to Product Media
-- =============================================
-- This migration adds video support by:
-- 1. Adding media_type column to product_images table
-- 2. Allowing 'image' or 'video' types
-- =============================================

-- Add media_type column to product_images
ALTER TABLE product_images 
  ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image';

-- Add constraint for valid media types
ALTER TABLE product_images 
  DROP CONSTRAINT IF EXISTS product_images_media_type_check;
  
ALTER TABLE product_images 
  ADD CONSTRAINT product_images_media_type_check 
  CHECK (media_type IN ('image', 'video'));

-- Create index for media type queries
CREATE INDEX IF NOT EXISTS idx_product_images_media_type ON product_images(media_type);

-- Add comment for documentation
COMMENT ON COLUMN product_images.media_type IS 
  'Type of media: image or video';
