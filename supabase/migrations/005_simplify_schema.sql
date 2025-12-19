-- =============================================
-- FlyCloth Schema Simplification Migration
-- Remove Categories, Remove Colors, Add Fit Variant
-- =============================================
-- This migration simplifies the schema for a single-brand
-- printed shirt e-commerce by:
-- 1. Removing the categories system
-- 2. Removing color variants (only printed shirts)
-- 3. Adding fit variant (slim, regular, oversize)
-- =============================================

-- Step 1: Drop category_id foreign key and column from products
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
DROP INDEX IF EXISTS idx_products_category_id;
ALTER TABLE products DROP COLUMN IF EXISTS category_id;

-- Step 2: Drop the categories table
DROP TABLE IF EXISTS categories;

-- Step 3: Remove color columns from product_variants
-- (printed shirts don't have color variants)
ALTER TABLE product_variants DROP COLUMN IF EXISTS color;
ALTER TABLE product_variants DROP COLUMN IF EXISTS color_hex;

-- Step 4: Add fit column to product_variants
-- Default to 'regular' for existing variants
ALTER TABLE product_variants 
  ADD COLUMN IF NOT EXISTS fit TEXT DEFAULT 'regular';

-- Add constraint for valid fit values
ALTER TABLE product_variants 
  DROP CONSTRAINT IF EXISTS product_variants_fit_check;
  
ALTER TABLE product_variants 
  ADD CONSTRAINT product_variants_fit_check 
  CHECK (fit IN ('slim', 'regular', 'oversize'));

-- Step 5: Create index for fit-based queries
CREATE INDEX IF NOT EXISTS idx_product_variants_fit ON product_variants(fit);

-- Add comment for documentation
COMMENT ON COLUMN product_variants.fit IS 
  'Fit type for the shirt variant: slim, regular, or oversize';
