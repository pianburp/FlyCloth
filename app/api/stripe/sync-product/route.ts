import { NextRequest, NextResponse } from 'next/server';
import { createStripeProduct, createStripePrice } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/rbac';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Check if already synced
    if (product.stripe_price_id) {
      return NextResponse.json({ 
        error: 'Product already synced to Stripe',
        stripeProductId: product.stripe_product_id,
        stripePriceId: product.stripe_price_id,
      }, { status: 400 });
    }

    // Create product in Stripe
    const stripeResult = await createStripeProduct({
      name: product.name,
      description: product.description || undefined,
      price: Number(product.base_price),
      sku: product.sku,
    });

    // Update product with Stripe IDs
    const { error: updateError } = await supabase
      .from('products')
      .update({
        stripe_product_id: stripeResult.productId,
        stripe_price_id: stripeResult.priceId,
      })
      .eq('id', productId);

    if (updateError) {
      console.error('Error updating product with Stripe IDs:', updateError);
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      stripeProductId: stripeResult.productId,
      stripePriceId: stripeResult.priceId,
    });
  } catch (error: any) {
    console.error('Error syncing product to Stripe:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync product to Stripe' },
      { status: 500 }
    );
  }
}
