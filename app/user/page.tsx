import { getUserProfile } from "@/lib/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ShirtIcon } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function UserDashboard() {
  const profile = await getUserProfile();
  const supabase = await createClient();

  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*, product_images(storage_path)')
    .eq('featured', true)
    .eq('is_active', true)
    .limit(6);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome to BajuNow!</h1>
        <p className="text-muted-foreground">
          Hi {profile?.email}, browse our collection of premium shirts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredProducts?.map((product) => {
          const imagePath = product.product_images?.[0]?.storage_path;
          const imageUrl = imagePath 
            ? supabase.storage.from('product-images').getPublicUrl(imagePath).data.publicUrl 
            : null;

          return (
            <Card key={product.id} className="flex flex-col h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                <CardDescription className="line-clamp-2">{product.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="w-full h-48 bg-muted rounded-md mb-4 flex items-center justify-center overflow-hidden">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ShirtIcon className="w-16 h-16 text-muted-foreground" />
                  )}
                </div>
                <p className="font-bold text-2xl text-primary">${product.base_price}</p>
              </CardContent>
              <CardFooter>
                <Link href={`/user/products/${product.id}`} className="w-full">
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
        
        {(!featuredProducts || featuredProducts.length === 0) && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <ShirtIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No featured products available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
