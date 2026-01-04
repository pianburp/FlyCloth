"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function updateVariant(
  variantId: string, 
  updates: { stock?: number; price?: number; is_active?: boolean },
  expectedUpdatedAt?: string  // For optimistic locking
) {
  await requireAdmin();
  
  const supabase = await createClient();
  
  // Validation: Apply reasonable limits
  const MAX_STOCK = 100000;
  const MAX_PRICE = 50000;
  const MIN_PRICE = 1;
  
  const dbUpdates: Record<string, any> = {
    updated_at: new Date().toISOString()
  };
  
  if (updates.stock !== undefined) {
    dbUpdates.stock_quantity = Math.min(MAX_STOCK, Math.max(0, Math.floor(updates.stock)));
  }
  if (updates.price !== undefined) {
    dbUpdates.price = Math.min(MAX_PRICE, Math.max(MIN_PRICE, updates.price));
  }
  if (updates.is_active !== undefined) {
    dbUpdates.is_active = updates.is_active;
  }

  // Build query with optimistic locking if timestamp provided
  let query = supabase
    .from('product_variants')
    .update(dbUpdates)
    .eq('id', variantId);
  
  // Optimistic locking: only update if row hasn't changed
  if (expectedUpdatedAt) {
    query = query.eq('updated_at', expectedUpdatedAt);
  }
  
  const { data, error, count } = await query.select('id').single();

  if (error) {
    // Check if it's a "no rows returned" error (row was modified by another user)
    if (error.code === 'PGRST116') {
      throw new Error("Update conflict: This item was modified by another user. Please refresh and try again.");
    }
    console.error("Error updating variant:", error);
    throw new Error("Failed to update variant");
  }

  revalidatePath('/admin/inventory');
  revalidatePath('/admin/products');
  
  return { success: true };
}

export async function deleteVariant(variantId: string) {
  await requireAdmin();
  const supabase = await createClient();

  // Check for existing order items referencing this variant
  const { count: orderItemCount } = await supabase
    .from('order_items')
    .select('*', { count: 'exact', head: true })
    .eq('variant_id', variantId);

  const hasOrderItems = (orderItemCount || 0) > 0;

  if (hasOrderItems) {
    // Soft delete: Keep variant for order history integrity
    const { error } = await supabase
      .from('product_variants')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', variantId);

    if (error) {
      console.error("Error soft-deleting variant:", error);
      throw new Error("Failed to deactivate variant");
    }
  } else {
    // Hard delete: No order history to preserve
    // First remove from any carts
    await supabase.from('cart_items').delete().eq('variant_id', variantId);
    
    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', variantId);

    if (error) {
      console.error("Error deleting variant:", error);
      throw new Error("Failed to delete variant");
    }
  }

  revalidatePath('/admin/inventory');
  revalidatePath('/admin/products');
  
  return { 
    success: true, 
    softDeleted: hasOrderItems 
  };
}
