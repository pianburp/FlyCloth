import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, sku, base_price, is_active, featured } = body;

    if (!name || !sku || base_price === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name,
        description: description || '',
        sku,
        base_price: Number(base_price),
        is_active: is_active ?? true,
        featured: featured ?? false
      })
      .select()
      .single();

    if (productError) {
      console.error('Error inserting product:', productError);
      return NextResponse.json({ error: productError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}

// PUT - Update an existing product
export async function PUT(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, description, sku, base_price, is_active, featured } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Update product details
    const { error: productError } = await supabase
      .from('products')
      .update({
        name,
        description: description || '',
        sku,
        base_price: Number(base_price),
        is_active,
        featured
      })
      .eq('id', id);

    if (productError) {
      console.error('Error updating product:', productError);
      return NextResponse.json({ error: productError.message }, { status: 500 });
    }

    // Sync base_price to all product variants
    const { error: variantsError } = await supabase
      .from('product_variants')
      .update({ price: Number(base_price) })
      .eq('product_id', id);

    if (variantsError) {
      console.error('Error syncing variant prices:', variantsError);
      // Don't fail the request, just log the error - product was already updated
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}
