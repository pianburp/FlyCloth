import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProductDetailsClient from "./product-details-client";
import ReviewsSection from "./reviews-section";
import { getCachedUserProfile } from "@/lib/rbac";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const supabase = await createClient();
  const { id } = await params;

  const { data: product } = await supabase
    .from('products')
    .select('name, description, base_price')
    .eq('id', id)
    .single();

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  return {
    title: product.name,
    description: product.description || `Shop ${product.name} at FlyCloth. Premium luxury fashion starting from RM${product.base_price}.`,
    openGraph: {
      title: `${product.name} | FlyCloth`,
      description: product.description || `Shop ${product.name} at FlyCloth. Premium luxury fashion.`,
      type: 'website',
      url: `${baseUrl}/user/products/${id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | FlyCloth`,
      description: product.description || `Shop ${product.name} at FlyCloth.`,
    },
    alternates: {
      canonical: `${baseUrl}/user/products/${id}`,
    },
  };
}

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  user_id: string;
  order_id: string;
  profiles: {
    full_name: string | null;
  } | null;
}

interface UserPurchase {
  order_id: string;
  existing_review: {
    id: string;
    rating: number;
    title: string | null;
    comment: string | null;
  } | null;
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  const profile = await getCachedUserProfile();

  // Fetch product
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (!product) {
    notFound();
  }

  // Fetch variants
  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', id)
    .eq('is_active', true);

  // Fetch images
  const { data: images } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', id)
    .order('sort_order', { ascending: true });

  // Fetch all reviews for this product with user info
  const { data: reviews } = await supabase
    .from('product_reviews')
    .select(`
      id,
      rating,
      title,
      comment,
      created_at,
      user_id,
      order_id,
      profiles (full_name)
    `)
    .eq('product_id', id)
    .order('created_at', { ascending: false });

  // If user is logged in, check if they have any delivered orders with this product
  let userPurchases: UserPurchase[] = [];

  if (profile) {
    // Get user's delivered orders that contain items with variants of this product
    const { data: deliveredOrders } = await supabase
      .from('orders')
      .select(`
        id,
        order_items!inner (
          variant_id,
          product_variants!inner (product_id)
        )
      `)
      .eq('user_id', profile.id)
      .eq('status', 'delivered');

    if (deliveredOrders) {
      // Filter to orders that have this specific product
      const ordersWithProduct = deliveredOrders.filter((order: any) =>
        order.order_items.some((item: any) =>
          item.product_variants?.product_id === id
        )
      );

      // For each qualifying order, check if user already has a review
      for (const order of ordersWithProduct) {
        const existingReview = reviews?.find(
          r => r.order_id === order.id && r.user_id === profile.id
        );

        userPurchases.push({
          order_id: order.id,
          existing_review: existingReview ? {
            id: existingReview.id,
            rating: existingReview.rating,
            title: existingReview.title,
            comment: existingReview.comment,
          } : null,
        });
      }
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <ProductDetailsClient
        product={product}
        variants={variants || []}
        images={images || []}
      />

      <ReviewsSection
        productId={id}
        productName={product.name}
        reviews={(reviews as unknown as Review[]) || []}
        userPurchases={userPurchases}
        isLoggedIn={!!profile}
      />
    </div>
  );
}
