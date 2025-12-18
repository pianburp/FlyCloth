"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  await requireAdmin();
  
  const name = formData.get('name') as string;
  if (!name?.trim()) {
    throw new Error("Category name is required");
  }

  const supabase = await createClient();
  
  const { error } = await supabase
    .from('categories')
    .insert({ name: name.trim() });

  if (error) {
    console.error("Error creating category:", error);
    throw new Error("Failed to create category");
  }

  revalidatePath('/admin/categories');
  revalidatePath('/admin/products');
}

export async function updateCategory(formData: FormData) {
  await requireAdmin();
  
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  
  if (!id || !name?.trim()) {
    throw new Error("Category ID and name are required");
  }

  const supabase = await createClient();
  
  const { error } = await supabase
    .from('categories')
    .update({ name: name.trim() })
    .eq('id', id);

  if (error) {
    console.error("Error updating category:", error);
    throw new Error("Failed to update category");
  }

  revalidatePath('/admin/categories');
  revalidatePath('/admin/products');
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  
  const id = formData.get('id') as string;
  if (!id) {
    throw new Error("Category ID is required");
  }

  const supabase = await createClient();
  
  // Check if category has products
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id);

  if (count && count > 0) {
    throw new Error("Cannot delete category with products");
  }
  
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting category:", error);
    throw new Error("Failed to delete category");
  }

  revalidatePath('/admin/categories');
}
