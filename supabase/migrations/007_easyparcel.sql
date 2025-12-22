-- =============================================
-- EasyParcel Shipment Integration
-- =============================================
-- Adds shipment tracking for EasyParcel courier integration
-- Extends store_settings with pickup address configuration

-- =============================================
-- 1. EXTEND ORDER STATUS
-- =============================================

-- Drop and recreate the status check constraint to add new statuses
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'paid', 'printing', 'awaiting_shipment', 'shipped', 'delivered', 'cancelled'));

-- =============================================
-- 2. EASYPARCEL SHIPMENTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS easyparcel_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- EasyParcel identifiers
  easyparcel_order_no TEXT NOT NULL,           -- e.g., "EI-5UFAI"
  parcel_no TEXT,                              -- e.g., "EP-PQKTE"
  awb TEXT,                                    -- Tracking number, e.g., "238770015234"
  
  -- URLs
  awb_label_url TEXT,                          -- AWB label download link
  tracking_url TEXT,                           -- Customer tracking link
  
  -- Courier info
  courier_name TEXT NOT NULL,                  -- e.g., "J&T Express"
  service_id TEXT NOT NULL,                    -- e.g., "EP-CS0JNT"
  
  -- Costs
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Payment status
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  
  -- Parcel details
  weight DECIMAL(10,2) DEFAULT 1.0,
  collect_date DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  
  UNIQUE(order_id)
);

CREATE INDEX IF NOT EXISTS idx_easyparcel_shipments_order_id ON easyparcel_shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_easyparcel_shipments_awb ON easyparcel_shipments(awb);
CREATE INDEX IF NOT EXISTS idx_easyparcel_shipments_payment_status ON easyparcel_shipments(payment_status);

-- =============================================
-- 3. ADD PICKUP ADDRESS TO STORE SETTINGS
-- =============================================

ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS pickup_name TEXT;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS pickup_company TEXT;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS pickup_contact TEXT;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS pickup_addr1 TEXT;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS pickup_addr2 TEXT;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS pickup_city TEXT;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS pickup_state TEXT;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS pickup_postcode TEXT;

-- =============================================
-- 4. ROW LEVEL SECURITY
-- =============================================

ALTER TABLE easyparcel_shipments ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage shipments"
ON easyparcel_shipments
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Users can read their own order shipments
CREATE POLICY "Users can view their shipments"
ON easyparcel_shipments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = easyparcel_shipments.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- =============================================
-- 5. GRANTS
-- =============================================

GRANT SELECT ON easyparcel_shipments TO authenticated;
GRANT INSERT ON easyparcel_shipments TO authenticated;
GRANT UPDATE ON easyparcel_shipments TO authenticated;
