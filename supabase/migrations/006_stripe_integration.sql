-- =============================================
-- Stripe Integration Migration
-- Add Stripe-specific columns for payment processing
-- =============================================

-- Add Stripe Price ID to products table for checkout
ALTER TABLE products ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Add Stripe-related fields to orders table for payment tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Add constraint for payment_status if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_payment_status_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
      CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));
  END IF;
END $$;

-- Create index for faster lookup by Stripe session ID
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);

-- Note: The coupons table is kept for legacy data but will no longer be used
-- Stripe Promotion Codes are now the source of truth for discounts
COMMENT ON TABLE coupons IS 'DEPRECATED: Use Stripe Promotion Codes instead. This table is kept for historical data only.';
