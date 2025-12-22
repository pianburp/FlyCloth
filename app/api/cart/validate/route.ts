import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/rbac';

export interface CartValidationIssue {
  variantId: string;
  productName: string;
  reason: 'OUT_OF_STOCK' | 'INSUFFICIENT_STOCK';
  requestedQuantity: number;
  availableStock: number;
}

export interface CartValidationResponse {
  valid: boolean;
  issues: CartValidationIssue[];
}

export async function GET(request: NextRequest) {
  try {
    const profile = await getUserProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Fetch cart items with current stock levels
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product_variants (
          id,
          stock_quantity,
          products (
            id,
            name
          )
        )
      `)
      .eq('user_id', profile.id);

    if (cartError) {
      console.error('Error fetching cart:', cartError);
      return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json<CartValidationResponse>({ valid: true, issues: [] });
    }

    const issues: CartValidationIssue[] = [];

    for (const item of cartItems) {
      const variant = item.product_variants as any;
      const product = variant?.products;
      const stockQuantity = variant?.stock_quantity ?? 0;
      const requestedQuantity = item.quantity;

      if (stockQuantity === 0) {
        issues.push({
          variantId: variant.id,
          productName: product?.name || 'Unknown Product',
          reason: 'OUT_OF_STOCK',
          requestedQuantity,
          availableStock: 0,
        });
      } else if (requestedQuantity > stockQuantity) {
        issues.push({
          variantId: variant.id,
          productName: product?.name || 'Unknown Product',
          reason: 'INSUFFICIENT_STOCK',
          requestedQuantity,
          availableStock: stockQuantity,
        });
      }
    }

    return NextResponse.json<CartValidationResponse>({
      valid: issues.length === 0,
      issues,
    });
  } catch (error) {
    console.error('Cart validation error:', error);
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
}
