-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
-- Stores notifications for users and admins
-- Admin notifications have user_id = NULL (broadcast to all admins)

-- Notification types enum-like constraint
-- order_created: User placed an order
-- order_status: Order status changed
-- payment_received: Admin notification for new payment
-- low_stock: Admin notification for low stock
-- out_of_stock: Admin notification for out of stock
-- bad_review: Admin notification for bad reviews (<=2 stars)

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'order_created', 
    'order_status', 
    'payment_received', 
    'low_stock', 
    'out_of_stock',
    'bad_review'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_admin ON notifications(user_id) WHERE user_id IS NULL;

-- =============================================
-- RLS POLICIES FOR NOTIFICATIONS
-- =============================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- Admins can read admin-targeted notifications (user_id IS NULL)
CREATE POLICY "Admins can read admin notifications" ON notifications
  FOR SELECT
  USING (
    user_id IS NULL AND public.is_admin()
  );

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can update admin notifications
CREATE POLICY "Admins can update admin notifications" ON notifications
  FOR UPDATE
  USING (user_id IS NULL AND public.is_admin())
  WITH CHECK (user_id IS NULL AND public.is_admin());

-- Only service role can insert (via service client in backend)
-- No INSERT policy for authenticated users - notifications created via service client

-- Grant permissions
GRANT SELECT, UPDATE ON notifications TO authenticated;
