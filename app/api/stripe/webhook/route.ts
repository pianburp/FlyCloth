import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/service';
import Stripe from 'stripe';

// Disable body parsing - Stripe needs the raw body for signature verification
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('Missing Stripe signature');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

/**
 * Handle successful checkout session completion
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const supabase = createServiceClient();

  // Get metadata from session
  const userId = session.metadata?.user_id;
  const cartItemsJson = session.metadata?.cart_items;

  if (!userId || !cartItemsJson) {
    console.error('Missing required metadata in checkout session');
    return;
  }

  const cartItems = JSON.parse(cartItemsJson);

  // Check if order already exists (idempotency)
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_session_id', session.id)
    .single();

  if (existingOrder) {
    console.log(`Order already exists for session ${session.id}`);
    return;
  }

  // Calculate amounts
  const totalAmount = (session.amount_total || 0) / 100; // Convert from cents
  const discountAmount = session.total_details?.amount_discount 
    ? session.total_details.amount_discount / 100 
    : 0;

  // Get shipping address from session if available
  // Use type assertion as shipping_details structure may vary by API version
  const sessionAny = session as any;
  const shippingDetails = sessionAny.shipping_details || sessionAny.collected_information?.shipping_details;
  const shippingAddress = shippingDetails?.address 
    ? {
        name: shippingDetails.name,
        line1: shippingDetails.address.line1,
        line2: shippingDetails.address.line2,
        city: shippingDetails.address.city,
        state: shippingDetails.address.state,
        postal_code: shippingDetails.address.postal_code,
        country: shippingDetails.address.country,
      }
    : null;

  // Create Order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      status: 'pending',
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
    throw orderError;
  }

  console.log(`Order created: ${order.id} for session ${session.id}`);

  // Create Order Items
  const orderItems = cartItems.map((item: any) => ({
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
  }

  // Update Stock
  await Promise.all(
    cartItems.map(async (item: any) => {
      const { data: variant } = await supabase
        .from('product_variants')
        .select('stock_quantity')
        .eq('id', item.variantId)
        .single();

      if (variant) {
        const newStock = Math.max(0, variant.stock_quantity - item.quantity);
        await supabase
          .from('product_variants')
          .update({ stock_quantity: newStock })
          .eq('id', item.variantId);
      }
    })
  );

  // Clear Cart
  await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);

  console.log(`Order ${order.id} processed successfully`);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const supabase = createServiceClient();

  // Update order status if it exists
  const { error } = await supabase
    .from('orders')
    .update({ payment_status: 'failed' })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (error) {
    console.error('Error updating failed payment status:', error);
  }

  console.log(`Payment failed for intent: ${paymentIntent.id}`);
}
