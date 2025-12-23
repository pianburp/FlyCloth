import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/rbac';
import { rateLimit } from '@/lib/rate-limit';

// Rate limiter: 5 checkout requests per minute per IP
const checkoutLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  maxRequests: 5,
});

export async function POST(request: NextRequest) {
  try {
    // =========================================================================
    // RATE LIMITING - Prevent checkout spam and DoS
    // =========================================================================
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const { success: rateLimitOk, remaining } = checkoutLimiter.check(ip);
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    // Verify user is authenticated
    const profile = await getUserProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { cartItems } = body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // =========================================================================
    // SECURITY: Only accept variantId and quantity from client
    // ALL OTHER DATA (price, name, etc.) MUST come from database
    // =========================================================================
    const clientItems = cartItems.map((item: any) => ({
      variantId: typeof item.variantId === 'string' ? item.variantId : null,
      quantity: typeof item.quantity === 'number' && item.quantity > 0 ? Math.floor(item.quantity) : 0,
      // These are for display only, will be overwritten by DB values
      size: item.size || '',
      variantInfo: item.variantInfo || '',
    })).filter(item => item.variantId && item.quantity > 0);

    if (clientItems.length === 0) {
      return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 });
    }

    const supabase = await createClient();
    const variantIds = clientItems.map(item => item.variantId);
    
    // Fetch AUTHORITATIVE product details from database
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select(`
        id,
        price,
        stock_quantity,
        size,
        fit,
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

    // Validate all variants exist
    if (!variants || variants.length !== clientItems.length) {
      return NextResponse.json({ error: 'One or more products not found' }, { status: 400 });
    }

    // =========================================================================
    // HARD GATE: Stock Validation - DO NOT CREATE STRIPE SESSION IF STOCK INVALID
    // This is the critical trust boundary - frontend cannot be trusted
    // =========================================================================
    const stockIssues: Array<{ variantId: string; productName: string; requested: number; available: number }> = [];
    
    for (const clientItem of clientItems) {
      const variant = variants.find((v: any) => v.id === clientItem.variantId);
      if (!variant) {
        const product = (variant as any)?.products;
        stockIssues.push({
          variantId: clientItem.variantId,
          productName: product?.name || 'Unknown Product',
          requested: clientItem.quantity,
          available: 0,
        });
        continue;
      }
      
      const stockQuantity = (variant as any).stock_quantity ?? 0;
      if (clientItem.quantity > stockQuantity) {
        const product = (variant as any).products;
        stockIssues.push({
          variantId: clientItem.variantId,
          productName: product?.name || 'Unknown Product',
          requested: clientItem.quantity,
          available: stockQuantity,
        });
      }
    }

    if (stockIssues.length > 0) {
      console.warn('Stock validation failed at checkout hard gate:', stockIssues);
      return NextResponse.json(
        { 
          error: 'Stock validation failed',
          code: 'INSUFFICIENT_STOCK',
          issues: stockIssues,
        },
        { status: 409 }
      );
    }
    // =========================================================================

    // =========================================================================
    // BUILD LINE ITEMS WITH DATABASE PRICES (NEVER CLIENT PRICES)
    // =========================================================================
    const lineItems = clientItems.map((clientItem) => {
      const variant = variants.find((v: any) => v.id === clientItem.variantId)!;
      const product = (variant as any).products as { id: string; name: string; stripe_price_id: string | null };
      const dbPrice = (variant as any).price as number;
      const size = (variant as any).size || clientItem.size;
      const fit = (variant as any).fit || clientItem.variantInfo;

      // If product has a Stripe price ID, use it (pre-validated price)
      if (product?.stripe_price_id) {
        return {
          price: product.stripe_price_id,
          quantity: clientItem.quantity,
        };
      }

      // Otherwise, create price_data with DATABASE price (NEVER client price)
      return {
        price_data: {
          currency: 'myr',
          product_data: {
            name: product.name,
            description: `${size} / ${fit}`,
          },
          unit_amount: Math.round(dbPrice * 100), // DATABASE price in cents
        },
        quantity: clientItem.quantity,
      };
    });

    // Get the app URL for redirects
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // =========================================================================
    // SECURE METADATA: Only store variant IDs and quantities
    // Prices will be re-fetched from DB in webhook handler
    // =========================================================================
    const metadataItems = clientItems.map((clientItem) => {
      const variant = variants.find((v: any) => v.id === clientItem.variantId)!;
      const product = (variant as any).products;
      return {
        variantId: clientItem.variantId,
        productId: (variant as any).product_id,
        quantity: clientItem.quantity,
        // Store DB values for order creation (not client values)
        name: product.name,
        size: (variant as any).size || '',
        variantInfo: (variant as any).fit || '',
        price: (variant as any).price, // DB price for order record
      };
    });

    const sessionOptions: any = {
      payment_method_types: ['card', 'grabpay'],
      mode: 'payment',
      line_items: lineItems,
      success_url: `${appUrl}/user/cart/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/user/cart/payment/cancel`,
      customer_email: profile.email,
      metadata: {
        user_id: profile.id,
        // Secure metadata - prices are from DB, not client
        cart_items: JSON.stringify(metadataItems),
      },
      shipping_address_collection: {
        allowed_countries: ['MY', 'SG', 'BN'],
      },
      allow_promotion_codes: true,
    };

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create(sessionOptions);

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
