'use server'

import { createClient } from "@/lib/supabase/server";
import { getCachedUserProfile } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProfile(formData: FormData) {
  const profile = await getCachedUserProfile();
  
  if (!profile) {
    redirect('/auth/login');
  }

  const supabase = await createClient();

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
    .eq('id', profile.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/user/settings');
  return { success: 'Profile updated successfully' };
}
