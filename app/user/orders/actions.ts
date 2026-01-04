"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserProfile } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { notifyBadReview } from "@/lib/services/notifications";
import { rateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/logging";

// Rate limiter for review operations (5 reviews per minute per user)
const reviewRateLimiter = rateLimit({
  interval: 60 * 1000,  // 1 minute
  maxRequests: 5,       // 5 requests per minute
});

export async function createReview(formData: FormData) {
  const profile = await getCachedUserProfile();
  if (!profile) {
    throw new Error("Not authenticated");
  }

  // Rate limit check
  const rateLimitResult = reviewRateLimiter.check(profile.id);
  if (!rateLimitResult.success) {
    throw new Error("Too many review requests. Please wait a moment and try again.");
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

  // SECURITY: Verify user owns this order and it's delivered
  const { data: validOrder } = await supabase
    .from('orders')
    .select(`
      id,
      order_items!inner (
        variant_id,
        product_variants!inner (product_id)
      )
    `)
    .eq('id', orderId)
    .eq('user_id', profile.id)
    .eq('status', 'delivered')
    .single();

  if (!validOrder) {
    throw new Error("You can only review products from your delivered orders");
  }

  // Verify this order contains the product being reviewed
  const orderHasProduct = (validOrder as any).order_items?.some((item: any) => 
    item.product_variants?.product_id === productId
  );
  
  if (!orderHasProduct) {
    throw new Error("This order does not contain the product you are trying to review");
  }

  // Check if user already reviewed this product for this order
  const { count: existingReviewCount } = await supabase
    .from('product_reviews')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', productId)
    .eq('order_id', orderId)
    .eq('user_id', profile.id);

  if (existingReviewCount && existingReviewCount > 0) {
    throw new Error("You have already reviewed this product for this order");
  }

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
    logError('Review.create', error);
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
    logError('Review.update', error);
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
    logError('Review.delete', error);
    throw new Error("Failed to delete review");
  }

  revalidatePath('/user/orders');
  revalidatePath('/user/products');
}
