-- =============================================
-- Seed Data (Optional - Sample categories)
-- =============================================

-- Sample categories
INSERT INTO categories (name) VALUES
  ('Slim Fit'),
  ('Regular Fit'),
  ('Plus Size'),
  ('Baggy Fit')
ON CONFLICT DO NOTHING;

-- Note: Coupons are deprecated. Use Stripe Promotion Codes instead.
-- Legacy coupons kept for reference only.
