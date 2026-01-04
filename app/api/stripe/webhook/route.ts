import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createOrderFromStripe } from '@/lib/services/orders';
import { createServiceClient } from '@/lib/supabase/service';
import Stripe from 'stripe';

// Disable body parsing - Stripe needs the raw body for signature verification
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    // Sanitized log - no details exposed
    console.error('Webhook: Missing signature header');
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Webhook: STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    // Sanitized error - don't expose verification details
    console.error('Webhook: Signature verification failed');
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const result = await createOrderFromStripe(session);
        if (!result.success) {
          console.error(`Webhook: Order creation failed for session ${session.id}`);
        }
        break;
      }

      case 'checkout.session.expired': {
        // Handle abandoned checkouts - useful for analytics and recovery emails
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSessionExpired(session);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      default:
        // Only log in development - logInfo is silent in production
        // Safe: event.type is not sensitive (e.g., "invoice.paid")
        if (process.env.NODE_ENV === 'development') {
          // Using inline log instead of import to keep webhook minimal
          console.log(`[Webhook] Unhandled: ${event.type}`);
        }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    // Sanitized error logging
    console.error('Webhook: Processing error occurred');
    return NextResponse.json({ error: 'Processing error' }, { status: 500 });
  }
}

/**
 * Handle expired checkout session (abandoned cart)
 */
async function handleSessionExpired(session: Stripe.Checkout.Session) {
  const supabase = createServiceClient();
  const userId = session.metadata?.user_id;

  if (!userId) {
    return;
  }

  // Optional: Track abandoned carts for analytics
  // await supabase.from('abandoned_carts').insert({
  //   user_id: userId,
  //   stripe_session_id: session.id,
  //   created_at: new Date().toISOString(),
  // });
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const supabase = createServiceClient();

  const { error } = await supabase
    .from('orders')
    .update({ payment_status: 'failed' })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (error) {
    console.error('Webhook: Failed to update payment status');
  }

}

