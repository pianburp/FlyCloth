import { getUserProfile } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PaymentClient from "./payment-client";

export default async function PaymentPage() {
  const profile = await getUserProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  const supabase = await createClient();

  const { data: cartData, error } = await supabase
    .from('cart_items')
    .select(`
      id,
      quantity,
      product_variants (
        id,
        size,
        color,
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

  const cartItems = cartData?.map((item: any) => {
    const variant = item.product_variants;
    const product = variant.products;
    const images = product.product_images || [];
    const primaryImage = images.find((img: any) => img.is_primary) || images[0];
    
    const imageUrl = primaryImage 
      ? supabase.storage.from('product-images').getPublicUrl(primaryImage.storage_path).data.publicUrl 
      : null;

    return {
      id: item.id,
      variantId: variant.id,
      name: product.name,
      price: Number(variant.price),
      size: variant.size,
      color: variant.color,
      quantity: item.quantity,
      image: imageUrl || ""
    };
  }) || [];

  return <PaymentClient cartItems={cartItems} userEmail={profile.email} />;
}