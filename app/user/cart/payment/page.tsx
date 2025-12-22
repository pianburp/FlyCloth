import { getCachedUserProfile } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PaymentClient from "./payment-client";
import { getStoreSettings } from "@/lib/services/store-settings";

export const dynamic = 'force-dynamic';

export default async function PaymentPage() {
  const profile = await getCachedUserProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  const supabase = await createClient();
  const storeSettings = await getStoreSettings();

  const { data: cartData, error } = await supabase
    .from('cart_items')
    .select(`
      id,
      quantity,
      product_variants (
        id,
        size,
        fit,
        gsm,
        price,
        products (
          name,
          product_images (
            storage_path,
            is_primary
          )
        )
      )
    `)
    .eq('user_id', profile.id);

  if (error) {
    console.error("Error fetching cart:", error);
  }

  // If cart is empty, redirect to cart page
  if (!cartData || cartData.length === 0) {
    redirect("/user/cart");
  }

  const cartItems = cartData?.map((item: any) => {
    const variant = item.product_variants;
    const product = variant.products;
    const images = product.product_images || [];
    const primaryImage = images.find((img: any) => img.is_primary) || images[0];

    const imageUrl = primaryImage
      ? supabase.storage.from('product-images').getPublicUrl(primaryImage.storage_path).data.publicUrl
      : null;

    // Build variant info string from fit and gsm
    const fitLabel = variant.fit === 'slim' ? 'Slim Fit' : variant.fit === 'oversize' ? 'Oversize Fit' : 'Regular Fit';
    const variantInfo = variant.gsm ? `${fitLabel} · ${variant.gsm}g` : fitLabel;

    return {
      id: item.id,
      variantId: variant.id,
      name: product.name,
      price: Number(variant.price),
      size: variant.size,
      variantInfo: variantInfo,
      quantity: item.quantity,
      image: imageUrl || ""
    };
  }) || [];

  return <PaymentClient cartItems={cartItems} userEmail={profile.email} storeSettings={storeSettings} />;
}

