import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/rbac';

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const profile = await getUserProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { cartItems, promoCode } = body;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch product details to get Stripe price IDs
    const variantIds = cartItems.map((item: any) => item.variantId);
    
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select(`
        id,
        price,
        product_id,
        products!inner(
          id,
          name,
          stripe_price_id
        )
      `)
      .in('id', variantIds);

    if (variantsError) {
      console.error('Error fetching variants:', variantsError);
      return NextResponse.json({ error: 'Failed to fetch product details' }, { status: 500 });
    }

    // Build line items for Stripe Checkout
    const lineItems = cartItems.map((item: any) => {
      const variant = variants?.find((v: any) => v.id === item.variantId);
      // Access products as any to avoid type issues with Supabase joins
      const product = variant?.products as { id: string; name: string; stripe_price_id: string | null } | undefined;

      // If product has a Stripe price ID, use it
      if (product?.stripe_price_id) {
        return {
          price: product.stripe_price_id,
          quantity: item.quantity,
        };
      }

      // Otherwise, create a price_data for ad-hoc pricing
      return {
        price_data: {
          currency: 'myr',
          product_data: {
            name: item.name,
            description: `${item.size} / ${item.variantInfo}`,
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    // Get the app URL for redirects
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Build checkout session options
    const sessionOptions: any = {
      payment_method_types: ['card', 'grabpay', 'fpx'], // Popular Malaysian payment methods
      mode: 'payment',
      line_items: lineItems,
      success_url: `${appUrl}/user/cart/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/user/cart/payment/cancel`,
      customer_email: profile.email,
      metadata: {
        user_id: profile.id,
        cart_items: JSON.stringify(
          cartItems.map((item: any) => ({
            variantId: item.variantId,
            name: item.name,
            variantInfo: item.variantInfo,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
          }))
        ),
      },
      shipping_address_collection: {
        allowed_countries: ['MY', 'SG', 'BN'], // Malaysia, Singapore, Brunei
      },
    };

    // Apply promotion code if provided
    if (promoCode) {
      const promotionCodes = await stripe.promotionCodes.list({
        code: promoCode,
        active: true,
        limit: 1,
      });

      if (promotionCodes.data.length > 0) {
        sessionOptions.discounts = [
          { promotion_code: promotionCodes.data[0].id },
        ];
      }
    }

    // Allow promotion codes to be entered at checkout
    if (!promoCode) {
      sessionOptions.allow_promotion_codes = true;
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create(sessionOptions);

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
