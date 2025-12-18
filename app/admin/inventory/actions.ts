"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function updateStock(variantId: string, newQuantity: number) {
  await requireAdmin();
  
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('product_variants')
    .update({ stock_quantity: Math.max(0, newQuantity) })
    .eq('id', variantId);

  if (error) {
    console.error("Error updating stock:", error);
    throw new Error("Failed to update stock");
  }

  revalidatePath('/admin/inventory');
  revalidatePath('/admin');
  revalidatePath('/admin/products');
}
