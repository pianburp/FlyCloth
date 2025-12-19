import { requireAdmin } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, Save, Trash2 } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await requireAdmin();
  } catch {
    redirect("/user");
  }

  // In a real app, you would fetch the product data using the ID
  const productId = id;

  // Mock data for demonstration
  const product = {
    id: productId,
    name: "Premium Cotton T-Shirt",
    sku: "SHIRT-001",
    price: 29.99,
    stock: 45,
    description: "High-quality cotton t-shirt with a comfortable fit. Perfect for casual wear.",
    fits: ['regular'],
    sizes: ['S', 'M', 'L', 'XL']
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Link href="/admin/products">
          <Button variant="outline" size="icon" className="w-8 h-8 sm:w-10 sm:h-10">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Edit Product</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Update product information for {product.name}
          </p>
        </div>
        <Button variant="destructive" size="sm" className="w-full sm:w-auto mt-2 sm:mt-0">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Product
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Product Information */}
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Update basic details about the shirt</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                defaultValue={product.name}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                defaultValue={product.sku}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  defaultValue={product.price}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  defaultValue={product.stock}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="w-full min-h-[100px] px-3 py-2 border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
                defaultValue={product.description}
              />
            </div>

          </CardContent>
        </Card>

        {/* Product Variants & Images */}
        <div className="space-y-8">
          {/* Current Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>Current photos and upload new ones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Images Display */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">Image 1</span>
                </div>
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">Image 2</span>
                </div>
              </div>

              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Add more images
                </p>
                <Button variant="outline" size="sm">
                  Choose Files
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Variants: Size & Fit */}
          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
              <CardDescription>Available sizes and fit types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Available Sizes</Label>
                <div className="flex flex-wrap gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                    <label key={size} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded"
                        defaultChecked={product.sizes.includes(size)}
                      />
                      <span className="text-sm">{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Available Fits</Label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { name: 'Slim Fit', value: 'slim' },
                    { name: 'Regular Fit', value: 'regular' },
                    { name: 'Oversize Fit', value: 'oversize' }
                  ].map((fit) => (
                    <label key={fit.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded"
                        defaultChecked={product.fits.includes(fit.value)}
                      />
                      <span className="text-sm">{fit.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link href="/admin/products" className="w-full sm:flex-1 order-2 sm:order-1">
              <Button variant="outline" className="w-full">Cancel</Button>
            </Link>
            <Button className="w-full sm:flex-1 order-1 sm:order-2">
              <Save className="w-4 h-4 mr-2" />
              Update Product
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}