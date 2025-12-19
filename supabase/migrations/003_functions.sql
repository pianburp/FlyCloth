-- =============================================
-- FlyCloth Database Functions (Consolidated)
-- =============================================
-- All RPC functions used by the application.
-- Run AFTER 001_schema.sql and 002_rls_policies.sql
-- =============================================

-- =============================================
-- STOCK MANAGEMENT FUNCTIONS
-- =============================================

-- Atomic stock decrement (prevents overselling)
CREATE OR REPLACE FUNCTION decrement_stock(
  p_variant_id UUID,
  p_amount INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  -- Lock the row and get current stock
  SELECT stock_quantity INTO current_stock
  FROM product_variants
  WHERE id = p_variant_id
  FOR UPDATE;
  
  IF current_stock IS NULL THEN
    RAISE EXCEPTION 'Variant not found: %', p_variant_id;
  END IF;
  
  IF current_stock >= p_amount THEN
    UPDATE product_variants
    SET stock_quantity = stock_quantity - p_amount
    WHERE id = p_variant_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- Atomic stock increment (for refunds/cancellations)
CREATE OR REPLACE FUNCTION increment_stock(
  p_variant_id UUID,
  p_amount INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE product_variants
  SET stock_quantity = stock_quantity + p_amount
  WHERE id = p_variant_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Variant not found: %', p_variant_id;
  END IF;
END;
$$;

-- Increment sold_count for products
CREATE OR REPLACE FUNCTION increment_sold_count(
  p_product_id UUID,
  p_amount INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products
  SET sold_count = sold_count + p_amount
  WHERE id = p_product_id;
END;
$$;

-- =============================================
-- PERMISSIONS
-- =============================================

GRANT EXECUTE ON FUNCTION decrement_stock(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_stock(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_sold_count(UUID, INTEGER) TO authenticated;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON FUNCTION decrement_stock IS 
  'Atomically decrements stock. Returns TRUE if successful, FALSE if insufficient stock.';

COMMENT ON FUNCTION increment_stock IS 
  'Atomically increments stock. Used for refunds and order cancellations.';

COMMENT ON FUNCTION increment_sold_count IS 
  'Increments sold_count on a product after successful order.';
