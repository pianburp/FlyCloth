"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function updateVariant(variantId: string, updates: { stock?: number; price?: number; is_active?: boolean }) {
  await requireAdmin();
  
  const supabase = await createClient();
  
    // Map fields to DB columns if needed (stock -> stock_quantity)
  const dbUpdates: any = {};
  if (updates.stock !== undefined) dbUpdates.stock_quantity = Math.max(0, updates.stock);
  if (updates.price !== undefined) dbUpdates.price = Math.max(0, updates.price);
  if (updates.is_active !== undefined) dbUpdates.is_active = updates.is_active;

  const { error } = await supabase
    .from('product_variants')
    .update(dbUpdates)
    .eq('id', variantId);

  if (error) {
    console.error("Error updating variant:", error);
    throw new Error("Failed to update variant");
  }

  revalidatePath('/admin/inventory');
  revalidatePath('/admin/products');
}

export async function deleteVariant(variantId: string) {
    await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase.from('product_variants').delete().eq('id', variantId);
    
    if (error) {
        console.error("Error deleting variant:", error);
        throw new Error("Failed to delete variant");
    }
    
    revalidatePath('/admin/inventory');
    revalidatePath('/admin/products');
}
