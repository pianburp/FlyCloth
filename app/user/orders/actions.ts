"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserProfile } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { notifyBadReview } from "@/lib/services/notifications";

export async function createReview(formData: FormData) {
  const profile = await getCachedUserProfile();
  if (!profile) {
    throw new Error("Not authenticated");
  }

  const productId = formData.get('productId') as string;
  const orderId = formData.get('orderId') as string;
  const rating = parseInt(formData.get('rating') as string);
  const title = formData.get('title') as string || null;
  const comment = formData.get('comment') as string || null;

  if (!productId || !orderId || !rating || rating < 1 || rating > 5) {
    throw new Error("Invalid review data");
  }

  const supabase = await createClient();

  // Get product name for notification
  const { data: product } = await supabase
    .from('products')
    .select('name')
    .eq('id', productId)
    .single();

  const { error } = await supabase
    .from('product_reviews')
    .insert({
      product_id: productId,
      order_id: orderId,
      user_id: profile.id,
      rating,
      title,
      comment,
    });

  if (error) {
    console.error("Error creating review:", error);
    throw new Error("Failed to create review");
  }

  // Notify admins of bad reviews (2 stars or below)
  if (rating <= 2 && product) {
    notifyBadReview(productId, product.name, rating, title);
  }

  revalidatePath('/user/orders');
  revalidatePath('/user/products');
}

export async function updateReview(formData: FormData) {
  const profile = await getCachedUserProfile();
  if (!profile) {
    throw new Error("Not authenticated");
  }

  const reviewId = formData.get('reviewId') as string;
  const rating = parseInt(formData.get('rating') as string);
  const title = formData.get('title') as string || null;
  const comment = formData.get('comment') as string || null;

  if (!reviewId || !rating || rating < 1 || rating > 5) {
    throw new Error("Invalid review data");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('product_reviews')
    .update({
      rating,
      title,
      comment,
    })
    .eq('id', reviewId)
    .eq('user_id', profile.id); // RLS backup

  if (error) {
    console.error("Error updating review:", error);
    throw new Error("Failed to update review");
  }

  revalidatePath('/user/orders');
  revalidatePath('/user/products');
}

export async function deleteReview(formData: FormData) {
  const profile = await getCachedUserProfile();
  if (!profile) {
    throw new Error("Not authenticated");
  }

  const reviewId = formData.get('reviewId') as string;

  if (!reviewId) {
    throw new Error("Review ID is required");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('product_reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', profile.id); // RLS backup

  if (error) {
    console.error("Error deleting review:", error);
    throw new Error("Failed to delete review");
  }

  revalidatePath('/user/orders');
  revalidatePath('/user/products');
}
