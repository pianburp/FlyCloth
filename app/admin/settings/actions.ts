'use server'

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateAdminProfile(formData: FormData) {
  // Ensure only admins can update their profile through this action
  try {
    await requireAdmin();
  } catch {
    redirect("/user");
  }

  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/auth/login');
  }

  const fullName = formData.get('fullName') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      phone: phone,
      address: address,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/settings');
  return { success: 'Profile updated successfully' };
}

export async function updateStoreSettings(formData: FormData) {
  // Ensure only admins can update store settings
  try {
    await requireAdmin();
  } catch {
    redirect("/user");
  }

  const supabase = await createClient();

  const shippingFee = parseFloat(formData.get('shippingFee') as string);
  const freeShippingThreshold = parseFloat(formData.get('freeShippingThreshold') as string);
  const taxRatePercent = parseFloat(formData.get('taxRate') as string);
  
  // Validate inputs
  if (isNaN(shippingFee) || shippingFee < 0) {
    return { error: 'Invalid shipping fee' };
  }
  if (isNaN(freeShippingThreshold) || freeShippingThreshold < 0) {
    return { error: 'Invalid free shipping threshold' };
  }
  if (isNaN(taxRatePercent) || taxRatePercent < 0 || taxRatePercent > 100) {
    return { error: 'Invalid tax rate (must be between 0 and 100)' };
  }

  // Convert tax rate from percentage to decimal
  const taxRate = taxRatePercent / 100;

  const { error } = await supabase
    .from('store_settings')
    .upsert({
      id: 'default',
      shipping_fee: shippingFee,
      free_shipping_threshold: freeShippingThreshold,
      tax_rate: taxRate,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/settings');
  revalidatePath('/user/cart');
  revalidatePath('/user/cart/payment');
  return { success: 'Store settings updated successfully' };
}
