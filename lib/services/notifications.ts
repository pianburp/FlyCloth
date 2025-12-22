/**
 * Notification Service
 * 
 * Centralized service for creating notifications.
 * Uses service client to bypass RLS for inserts.
 */

import { createServiceClient } from '@/lib/supabase/service';

// =============================================================================
// TYPES
// =============================================================================

export type NotificationType = 
  | 'order_created'      // User: their order was placed
  | 'order_status'       // User: their order status changed
  | 'payment_received'   // Admin: new payment received
  | 'low_stock'          // Admin: stock dropped below 25
  | 'out_of_stock'       // Admin: stock reached 0
  | 'bad_review';        // Admin: review with <= 2 stars

export interface CreateNotificationParams {
  userId: string | null;  // null = admin notification
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Create a single notification
 */
export async function createNotification(params: CreateNotificationParams): Promise<void> {
  const supabase = createServiceClient();
  
  const { error } = await supabase.from('notifications').insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    link: params.link || null,
    metadata: params.metadata || {},
  });

  if (error) {
    console.error('Failed to create notification:', error);
    // Don't throw - notifications are non-critical
  }
}

/**
 * Notify all admins (creates a single notification with user_id = null)
 */
export async function notifyAdmins(
  type: NotificationType,
  title: string,
  message: string,
  link?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await createNotification({
    userId: null,
    type,
    title,
    message,
    link,
    metadata,
  });
}

/**
 * Notify a specific user
 */
export async function notifyUser(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await createNotification({
    userId,
    type,
    title,
    message,
    link,
    metadata,
  });
}

// =============================================================================
// SPECIALIZED NOTIFICATION HELPERS
// =============================================================================

/**
 * Notify when a new order is placed and paid
 * Creates both admin and user notifications
 */
export async function notifyNewOrder(
  orderId: string,
  userId: string,
  totalAmount: number
): Promise<void> {
  const shortOrderId = orderId.slice(0, 8);
  const formattedTotal = `RM${totalAmount.toFixed(2)}`;
  
  // Notify user
  await notifyUser(
    userId,
    'order_created',
    'Order Confirmed',
    `Your order #${shortOrderId} for ${formattedTotal} has been received and is being processed.`,
    `/user/orders`
  );
  
  // Notify admins
  await notifyAdmins(
    'payment_received',
    'New Order Received',
    `Order #${shortOrderId} for ${formattedTotal} has been placed and paid.`,
    `/admin/orders/${orderId}`,
    { orderId, totalAmount }
  );
}

/**
 * Notify when order status changes
 */
export async function notifyOrderStatusChange(
  orderId: string,
  userId: string,
  oldStatus: string,
  newStatus: string
): Promise<void> {
  const shortOrderId = orderId.slice(0, 8);
  
  const statusMessages: Record<string, string> = {
    processing: 'is now being processed',
    shipped: 'has been shipped',
    delivered: 'has been delivered',
    cancelled: 'has been cancelled',
  };
  
  const message = statusMessages[newStatus] || `status changed to ${newStatus}`;
  
  await notifyUser(
    userId,
    'order_status',
    `Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
    `Your order #${shortOrderId} ${message}.`,
    `/user/orders`,
    { orderId, oldStatus, newStatus }
  );
}

/**
 * Notify admins of low stock
 * Only call this when stock FIRST drops below threshold
 */
export async function notifyLowStock(
  variantId: string,
  productName: string,
  variantInfo: string,
  currentStock: number
): Promise<void> {
  const isOutOfStock = currentStock === 0;
  
  await notifyAdmins(
    isOutOfStock ? 'out_of_stock' : 'low_stock',
    isOutOfStock ? 'Out of Stock Alert' : 'Low Stock Alert',
    isOutOfStock 
      ? `${productName} (${variantInfo}) is now out of stock!`
      : `${productName} (${variantInfo}) has only ${currentStock} items left.`,
    `/admin/inventory`,
    { variantId, productName, variantInfo, currentStock }
  );
}

/**
 * Notify admins of a bad review (2 stars or below)
 */
export async function notifyBadReview(
  productId: string,
  productName: string,
  rating: number,
  reviewTitle?: string | null
): Promise<void> {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  
  await notifyAdmins(
    'bad_review',
    'Low Rating Review',
    `${productName} received a ${rating}-star review${reviewTitle ? `: "${reviewTitle}"` : ''} ${stars}`,
    `/admin/reviews`,
    { productId, rating, reviewTitle }
  );
}

// =============================================================================
// STOCK CHECK HELPER
// =============================================================================

const LOW_STOCK_THRESHOLD = 25;

/**
 * Check stock levels after a purchase and notify if needed
 * Only notifies on FIRST drop below threshold
 */
export async function checkAndNotifyLowStock(
  variantId: string,
  productName: string,
  variantInfo: string,
  previousStock: number,
  currentStock: number
): Promise<void> {
  // Only notify if we just crossed the threshold
  if (previousStock >= LOW_STOCK_THRESHOLD && currentStock < LOW_STOCK_THRESHOLD) {
    await notifyLowStock(variantId, productName, variantInfo, currentStock);
  } else if (previousStock > 0 && currentStock === 0) {
    // Always notify when going out of stock
    await notifyLowStock(variantId, productName, variantInfo, currentStock);
  }
}
