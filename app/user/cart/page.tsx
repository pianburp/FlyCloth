import { getUserProfile } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { CartManagement } from "@/components/cart-management";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export default async function CartPage() {
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
        size,
        color,
        price,
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

    return {
      id: item.id,
      productId: product.id,
      name: product.name,
      price: Number(variant.price),
      size: variant.size,
      color: variant.color,
      quantity: item.quantity,
      image: imageUrl || ""
    };
  }) || [];

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground">
          Review your selected items and proceed to checkout
        </p>
      </div>

      <CartManagement initialItems={cartItems} userId={profile.id} />
    </div>
  );
}
