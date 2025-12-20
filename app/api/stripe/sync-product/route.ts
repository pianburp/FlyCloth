import { NextRequest, NextResponse } from 'next/server';
import { createStripeProduct, updateStripeProduct, createStripePrice, isStripeEnabled, stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/rbac';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if Stripe is configured
  if (!isStripeEnabled()) {
    return NextResponse.json(
      { error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let stripeProductId = product.stripe_product_id;
    let stripePriceId = product.stripe_price_id;

    // Determine if this is a create or update operation
    if (!stripeProductId) {
      // CREATE: Product doesn't exist in Stripe yet
      const stripeResult = await createStripeProduct({
        name: product.name,
        description: product.description || undefined,
        price: Number(product.base_price),
        sku: product.sku,
      });

      stripeProductId = stripeResult.productId;
      stripePriceId = stripeResult.priceId;
    } else {
      // UPDATE: Product already exists in Stripe
      // 1. Update product details (name, description, active status)
      await updateStripeProduct(stripeProductId, {
        name: product.name,
        description: product.description || undefined,
        active: product.is_active,
      });

      // 2. Check if price changed - if so, create new price and archive old
      if (stripePriceId) {
        const existingPrice = await stripe.prices.retrieve(stripePriceId);
        const currentPriceInCents = Math.round(Number(product.base_price) * 100);

        if (existingPrice.unit_amount !== currentPriceInCents) {
          // Create new price
          const newPrice = await createStripePrice(stripeProductId, Number(product.base_price));
          
          // Archive old price
          await stripe.prices.update(stripePriceId, { active: false });
          
          stripePriceId = newPrice.id;
        }
      }
    }

    // Update product with Stripe IDs
    const { error: updateError } = await supabase
      .from('products')
      .update({
        stripe_product_id: stripeProductId,
        stripe_price_id: stripePriceId,
      })
      .eq('id', productId);

    if (updateError) {
      console.error('Error updating product with Stripe IDs:', updateError);
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      stripeProductId,
      stripePriceId,
      action: product.stripe_product_id ? 'updated' : 'created',
    });
  } catch (error: any) {
    console.error('Error syncing product to Stripe:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync product to Stripe' },
      { status: 500 }
    );
  }
}

