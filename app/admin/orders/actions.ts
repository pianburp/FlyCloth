'use server'

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, newStatus: string) {
  await requireAdmin();
  
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);
    
  if (error) {
    throw new Error(error.message);
  }
  
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}
