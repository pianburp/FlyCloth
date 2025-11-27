import { getUserProfile } from "@/lib/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShirtIcon, Star } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ProductFilters } from "@/components/product-filters";

export const dynamic = 'force-dynamic';

export default async function UserDashboard(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const profile = await getUserProfile();
  const supabase = await createClient();

  // Fetch categories for filters
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name');

  // Fetch featured products for the hero section
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*, product_images(storage_path), product_variants(stock_quantity)')
    .eq('featured', true)
    .eq('is_active', true)
    .limit(3);

  // Build query for all products
  let query = supabase
    .from('products')
    .select('*, product_images(storage_path), product_variants(stock_quantity)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // Apply filters
  const categoryId = searchParams?.category as string;
  const minPrice = searchParams?.minPrice as string;
  const maxPrice = searchParams?.maxPrice as string;

  if (categoryId && categoryId !== 'all') {
    query = query.eq('category_id', categoryId);
  }

  if (minPrice) {
    query = query.gte('base_price', minPrice);
  }

  if (maxPrice) {
    query = query.lte('base_price', maxPrice);
  }

  // Fetch all active products
  const { data: allProducts } = await query.limit(12);

  return (
    <div className="flex flex-col gap-10 pb-10">
      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden min-h-[400px] flex items-center">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/video/hero-user.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Content */}
        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 w-full">
          <div className="space-y-4 max-w-xl">
            <Badge className="mb-2 bg-white/20 text-white hover:bg-white/30 border-none">New Collection</Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              Premium Shirts for Every Occasion
            </h1>
            <p className="text-lg text-gray-200">
              Welcome back, {profile?.full_name}. Discover our latest arrivals and timeless classics designed for comfort and style.
            </p>
            <Button size="lg" variant="secondary" asChild className="font-semibold">
              <Link href="#products">Shop Now</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Featured Section */}
      {featuredProducts && featuredProducts.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              Featured Products
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} supabase={supabase} featured />
            ))}
          </div>
        </div>
      )}

      {/* All Products Section */}
      <div id="products" className="space-y-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">All Products</h2>
          <ProductFilters categories={categories || []} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {allProducts?.map((product) => (
            <ProductCard key={product.id} product={product} supabase={supabase} />
          ))}
          
          {(!allProducts || allProducts.length === 0) && (
            <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/30 rounded-lg">
              <ShirtIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No products available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, supabase, featured = false }: { product: any, supabase: any, featured?: boolean }) {
  const imagePath = product.product_images?.[0]?.storage_path;
  const imageUrl = imagePath 
    ? supabase.storage.from('product-images').getPublicUrl(imagePath).data.publicUrl 
    : null;

  const isLowStock = product.product_variants?.some((v: any) => v.stock_quantity < 25);

  return (
    <Card className={`flex flex-col h-full group overflow-hidden border-muted transition-all duration-300 hover:shadow-lg ${featured ? 'border-primary/20 bg-primary/5' : ''}`}>
      <div className="relative aspect-[4/5] bg-muted overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <ShirtIcon className="w-16 h-16 text-muted-foreground/50" />
          </div>
        )}
        {featured && (
          <Badge className="absolute top-3 right-3 bg-yellow-500 hover:bg-yellow-600 text-white border-none">
            Featured
          </Badge>
        )}
        {isLowStock && (
          <Badge className={`absolute top-3 ${featured ? 'left-3' : 'right-3'} bg-orange-500 hover:bg-orange-600 text-white border-none`}>
            Low Stock
          </Badge>
        )}
      </div>
      
      <CardHeader className="p-4 pb-2">
        <CardTitle className="line-clamp-1 text-lg">{product.name}</CardTitle>
        <CardDescription className="line-clamp-1 text-xs mt-1">
          {product.sku}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 flex-grow">
        <p className="font-bold text-xl text-primary mt-2">RM{product.base_price}</p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Link href={`/user/products/${product.id}`} className="w-full">
          <Button 
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" 
            variant={featured ? "default" : "secondary"}
          >
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
