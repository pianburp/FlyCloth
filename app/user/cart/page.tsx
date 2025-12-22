import { getCachedUserProfile } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { CartManagement } from "@/components/cart";
import { createClient } from "@/lib/supabase/server";
import { getStoreSettings } from "@/lib/services/store-settings";

export const dynamic = 'force-dynamic';

export default async function CartPage() {
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
        stock_quantity,
        products (
          id,
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
    // Handle error appropriately, maybe show empty cart or error message
  }

  const cartItems = cartData?.map((item: any) => {
    const variant = item.product_variants;
    const product = variant.products;
    // Sort images to prioritize primary, then others
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
      productId: product.id,
      name: product.name,
      price: Number(variant.price),
      size: variant.size,
      variantInfo: variantInfo,
      quantity: item.quantity,
      stockQuantity: variant.stock_quantity,
      image: imageUrl || ""
    };
  }) || [];

  return (
    <div className="flex flex-col gap-8 sm:gap-10 max-w-6xl mx-auto">
      {/* Luxury Page Header */}
      <div className="luxury-page-header">
        <h1>Shopping Cart</h1>
        <p>Review your curated pieces before checkout</p>
        <div className="gold-divider mt-6" />
      </div>

      <CartManagement initialItems={cartItems} userId={profile.id} storeSettings={storeSettings} />
    </div>
  );
}

