/**
 * Order Service - Single Source of Truth for Order Creation
 * 
 * IMPORTANT: Orders are ONLY created here, triggered by Stripe webhooks.
 * No other code path should create orders.
 */

import { createServiceClient } from '@/lib/supabase/service';
import { stripe } from '@/lib/stripe';
import type Stripe from 'stripe';

// =============================================================================
// TYPES
// =============================================================================

export interface CartItemForOrder {
  variantId: string;
  productId?: string;
  name: string;
  size: string;
  variantInfo: string;
  quantity: number;
  price: number;
}

export interface OrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
  refunded?: boolean;
}

// =============================================================================
// ORDER CREATION (Stripe Webhook Only)
// =============================================================================

/**
 * Create an order from a completed Stripe checkout session.
 * This is the ONLY function that should create orders.
 * 
 * Features:
 * - Idempotency: Safe to call multiple times (Stripe retries webhooks)
 * - Atomic stock updates via RPC
 * - Cart clearing
 * - Sold count updates
 */
export async function createOrderFromStripe(
  session: Stripe.Checkout.Session
): Promise<OrderResult> {
  const supabase = createServiceClient();

  // Extract metadata
  const userId = session.metadata?.user_id;
  const cartItemsJson = session.metadata?.cart_items;

  if (!userId || !cartItemsJson) {
    console.error('Missing required metadata in checkout session');
    return { success: false, error: 'Missing required metadata' };
  }

  // Idempotency check - Stripe retries webhooks!
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_session_id', session.id)
    .single();

  if (existingOrder) {
    console.log(`Order already exists for session ${session.id}: ${existingOrder.id}`);
    return { success: true, orderId: existingOrder.id };
  }

  const cartItems: CartItemForOrder[] = JSON.parse(cartItemsJson);

  // Calculate amounts (Stripe uses cents)
  const totalAmount = (session.amount_total || 0) / 100;
  const discountAmount = session.total_details?.amount_discount
    ? session.total_details.amount_discount / 100
    : 0;

  // Extract shipping address
  const shippingAddress = extractShippingAddress(session);

  // 1. Decrement stock atomically
  const stockResults = await decrementStockForItems(supabase, cartItems);
  const failedItems = stockResults.filter(r => !r.success);
  
  if (failedItems.length > 0) {
    // Rollback successful decrements
    await rollbackStockDecrements(supabase, stockResults, cartItems);
    
    // =========================================================================
    // AUTOMATIC REFUND: Race condition loser - someone else got the last stock
    // =========================================================================
    const paymentIntentId = session.payment_intent as string;
    if (paymentIntentId) {
      try {
        await stripe.refunds.create({
          payment_intent: paymentIntentId,
          reason: 'requested_by_customer', // Stock unavailable
        });
        console.log(`Auto-refunded payment ${paymentIntentId} due to insufficient stock`);
        
        // Optionally: Create a failed order record for tracking
        await supabase.from('orders').insert({
          user_id: userId,
          status: 'cancelled',
          total_amount: (session.amount_total || 0) / 100,
          stripe_session_id: session.id,
          stripe_payment_intent_id: paymentIntentId,
          payment_status: 'refunded',
          notes: `Auto-refunded: Insufficient stock for items: ${failedItems.map(f => f.variantId).join(', ')}`,
        });
      } catch (refundError) {
        console.error('Failed to auto-refund:', refundError);
        // TODO: Queue for manual review
      }
    }
    // =========================================================================
    
    return { 
      success: false, 
      error: `Insufficient stock for items: ${failedItems.map(f => f.variantId).join(', ')}`,
      refunded: true,
    };
  }

  // 2. Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      status: 'paid', // Stripe-only = already paid
      total_amount: totalAmount,
      discount_amount: discountAmount,
      shipping_address: shippingAddress,
      payment_method: session.payment_method_types?.[0] || 'card',
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
      payment_status: 'paid',
    })
    .select()
    .single();

  if (orderError) {
    console.error('Error creating order:', orderError);
    // Rollback stock
    await rollbackStockDecrements(supabase, stockResults, cartItems);
    return { success: false, error: orderError.message };
  }

  console.log(`Order created: ${order.id} for session ${session.id}`);

  // 3. Create order items
  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    variant_id: item.variantId,
    product_name: item.name,
    variant_info: `${item.size} / ${item.variantInfo}`,
    quantity: item.quantity,
    unit_price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    // Order already created, log but don't fail
  }

  // 4. Update sold counts (fire and forget)
  updateSoldCounts(supabase, cartItems);

  // 5. Clear cart
  await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);

  console.log(`Order ${order.id} processed successfully`);
  return { success: true, orderId: order.id };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function extractShippingAddress(session: Stripe.Checkout.Session) {
  // Handle different Stripe API versions
  const sessionAny = session as any;
  const shippingDetails = 
    sessionAny.shipping_details || 
    sessionAny.collected_information?.shipping_details;

  if (!shippingDetails?.address) return null;

  return {
    name: shippingDetails.name,
    line1: shippingDetails.address.line1,
    line2: shippingDetails.address.line2,
    city: shippingDetails.address.city,
    state: shippingDetails.address.state,
    postal_code: shippingDetails.address.postal_code,
    country: shippingDetails.address.country,
  };
}

async function decrementStockForItems(
  supabase: ReturnType<typeof createServiceClient>,
  items: CartItemForOrder[]
) {
  return Promise.all(
    items.map(async (item) => {
      const { data: success, error } = await supabase.rpc('decrement_stock', {
        p_variant_id: item.variantId,
        p_amount: item.quantity,
      });

      if (error) {
        console.error(`Error decrementing stock for ${item.variantId}:`, error);
        return { variantId: item.variantId, success: false };
      }

      return { variantId: item.variantId, success: success === true };
    })
  );
}

async function rollbackStockDecrements(
  supabase: ReturnType<typeof createServiceClient>,
  stockResults: Array<{ variantId: string; success: boolean }>,
  items: CartItemForOrder[]
) {
  const successfulItems = stockResults.filter(r => r.success);
  await Promise.all(
    successfulItems.map(async (item) => {
      const originalItem = items.find(i => i.variantId === item.variantId);
      if (originalItem) {
        await supabase.rpc('increment_stock', {
          p_variant_id: item.variantId,
          p_amount: originalItem.quantity,
        });
      }
    })
  );
}

function updateSoldCounts(
  supabase: ReturnType<typeof createServiceClient>,
  items: CartItemForOrder[]
) {
  const productQuantities = items.reduce((acc, item) => {
    if (item.productId) {
      acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
    }
    return acc;
  }, {} as Record<string, number>);

  Object.entries(productQuantities).forEach(([productId, quantity]) => {
    supabase.rpc('increment_sold_count', {
      p_product_id: productId,
      p_amount: quantity,
    }).then(({ error }) => {
      if (error) console.error('Error updating sold_count:', error);
    });
  });
}
