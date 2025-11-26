-- =============================================
-- Seed Data (Optional - Sample categories and coupons)
-- =============================================

-- Sample categories
INSERT INTO categories (name) VALUES
  ('Casual'),
  ('Formal'),
  ('Polo'),
  ('Graphic Tee'),
  ('Tank Top')
ON CONFLICT DO NOTHING;

-- Sample coupons
INSERT INTO coupons (code, discount_type, discount_value, is_active) VALUES
  ('SAVE10', 'percentage', 10, true),
  ('NEWUSER', 'percentage', 15, true),
  ('SAVE5', 'fixed', 5, true),
  ('FREESHIP', 'shipping', 9.99, true)
ON CONFLICT DO NOTHING;
