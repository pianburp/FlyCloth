-- =============================================
-- Store Settings Table
-- =============================================
-- Stores configurable store settings like shipping fee,
-- free shipping threshold, and tax rate.
-- Uses single-row pattern with id = 'default'

CREATE TABLE IF NOT EXISTS store_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 9.99,
  free_shipping_threshold DECIMAL(10,2) NOT NULL DEFAULT 50.00,
  tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0.08,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default row if it doesn't exist
INSERT INTO store_settings (id, shipping_fee, free_shipping_threshold, tax_rate)
VALUES ('default', 9.99, 50.00, 0.08)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read store settings
CREATE POLICY "Anyone can read store settings"
ON store_settings
FOR SELECT
USING (true);

-- Only admins can update store settings
CREATE POLICY "Admins can update store settings"
ON store_settings
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Only admins can insert store settings (for initial setup)
CREATE POLICY "Admins can insert store settings"
ON store_settings
FOR INSERT
WITH CHECK (public.is_admin());

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_store_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

DROP TRIGGER IF EXISTS store_settings_updated_at ON store_settings;
CREATE TRIGGER store_settings_updated_at
  BEFORE UPDATE ON store_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_store_settings_updated_at();

-- Grant access to authenticated users
GRANT SELECT ON store_settings TO authenticated;
GRANT INSERT ON store_settings TO authenticated;
GRANT UPDATE ON store_settings TO authenticated;
GRANT SELECT ON store_settings TO anon;
