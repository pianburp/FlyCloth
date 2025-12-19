-- =============================================
-- Add GSM (Grams per Square Meter) Variant
-- =============================================
-- GSM is the fabric weight measurement for t-shirts
-- Common values: 150 (lightweight), 180 (standard), 220 (heavyweight)
-- =============================================

-- Add gsm column to product_variants
ALTER TABLE product_variants 
  ADD COLUMN IF NOT EXISTS gsm INTEGER DEFAULT 180;

-- Create index for gsm-based queries
CREATE INDEX IF NOT EXISTS idx_product_variants_gsm ON product_variants(gsm);

-- Add comment for documentation
COMMENT ON COLUMN product_variants.gsm IS 
  'Fabric weight in grams per square meter (GSM). Common values: 150 (lightweight), 180 (standard), 220 (heavyweight)';
