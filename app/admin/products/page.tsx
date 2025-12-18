import { requireAdmin } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShirtIcon, PlusIcon, Pencil, Trash2, Package, TicketPercent, ExternalLink, Zap, CheckCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { StripeGuideSheet } from "./stripe-guide-sheet";

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/user");
  }

  const supabase = await createClient();

  // Fetch products first (including Stripe fields)
  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('*, stripe_product_id, stripe_price_id')
    .order('created_at', { ascending: false });

  if (productsError) {
    console.error("Error fetching products:", JSON.stringify(productsError, null, 2));
    return <div>Error loading products. Please check logs.</div>;
  }

  // Fetch variants and images separately to avoid join issues
  const productIds = productsData.map(p => p.id);

  const { data: variantsData, error: variantsError } = await supabase
    .from('product_variants')
    .select('product_id, stock_quantity')
    .in('product_id', productIds);

  if (variantsError) {
    console.error("Error fetching variants:", JSON.stringify(variantsError, null, 2));
  }

  const { data: imagesData, error: imagesError } = await supabase
    .from('product_images')
    .select('product_id, storage_path, is_primary')
    .in('product_id', productIds);

  if (imagesError) {
    console.error("Error fetching images:", JSON.stringify(imagesError, null, 2));
  }

  // Merge data
  const products = productsData.map(product => {
    const variants = variantsData?.filter(v => v.product_id === product.id) || [];
    const images = imagesData?.filter(img => img.product_id === product.id) || [];
    return {
      ...product,
      product_variants: variants,
      product_images: images
    };
  });

  // Count synced products
  const syncedCount = products.filter(p => p.stripe_price_id).length;

  async function deleteProduct(formData: FormData) {
    'use server'
    const id = formData.get('id') as string;
    if (!id) return;

    const supabase = await createClient();
    await supabase.from('products').delete().eq('id', id);
    revalidatePath('/admin/products');
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Product Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your shirt inventory and pricing
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <StripeGuideSheet />
          <Link href="/admin/products/add">
            <Button className="flex-1 sm:flex-none">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>Manage your shirt collection ({products?.length || 0} items)</CardDescription>
        </CardHeader>
        <CardContent>
          {!products || products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No products found. Start by adding one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                // Calculate total stock
                const totalStock = product.product_variants?.reduce((sum: number, v: any) => sum + (v.stock_quantity || 0), 0) || 0;
                const hasLowStock = product.product_variants?.some((v: any) => (v.stock_quantity || 0) < 25);
                const isSynced = !!product.stripe_price_id;

                // Get primary image or first image
                const primaryImage = product.product_images?.find((img: any) => img.is_primary) || product.product_images?.[0];
                const imageUrl = primaryImage?.storage_path
                  ? supabase.storage.from('product-images').getPublicUrl(primaryImage.storage_path).data.publicUrl
                  : null;

                return (
                  <div key={product.id} className="border rounded-lg p-4 flex flex-col h-full hover:shadow-md transition-shadow bg-card">
                    <div className="w-full h-48 bg-muted rounded-md mb-4 flex items-center justify-center overflow-hidden relative">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShirtIcon className="w-16 h-16 text-muted-foreground" />
                      )}
                      {!product.is_active && (
                        <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded">
                          Inactive
                        </div>
                      )}
                      {product.featured && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          Featured
                        </div>
                      )}
                      {hasLowStock && product.is_active && (
                        <div className="absolute bottom-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded shadow-sm">
                          Low Stock
                        </div>
                      )}
                      {/* Stripe Sync Status Badge */}
                      {isSynced && (
                        <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-sm flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Stripe
                        </div>
                      )}
                    </div>

                    <div className="flex-grow">
                      <h3 className="font-semibold mb-1 line-clamp-1" title={product.name}>{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">SKU: {product.sku}</p>

                      <div className="flex justify-between items-center mb-4">
                        <p className="font-bold text-lg">RM{product.base_price}</p>
                        <div className={`text-sm ${totalStock === 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {totalStock} in stock
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <Link href={`/admin/products/${product.id}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <form action={deleteProduct} className="flex-1">
                        <input type="hidden" name="id" value={product.id} />
                        <Button variant="destructive" size="sm" type="submit" className="w-full">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
