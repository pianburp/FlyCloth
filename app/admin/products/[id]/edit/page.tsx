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
    category: "casual",
    brand: "BajuNow Original",
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Navy']
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">Edit Product</h1>
          <p className="text-muted-foreground">
            Update product information for {product.name}
          </p>
        </div>
        <Button variant="destructive" size="sm">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Product
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select 
                  id="category"
                  defaultValue={product.category}
                  className="w-full px-3 py-2 border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                >
                  <option value="">Select Category</option>
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                  <option value="polo">Polo</option>
                  <option value="graphic">Graphic Tee</option>
                  <option value="tank">Tank Top</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input 
                  id="brand" 
                  defaultValue={product.brand}
                  className="w-full"
                />
              </div>
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

          {/* Size & Color Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
              <CardDescription>Available sizes and colors</CardDescription>
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
                <Label>Available Colors</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'White', value: '#ffffff' },
                    { name: 'Black', value: '#000000' },
                    { name: 'Navy', value: '#1e3a8a' },
                    { name: 'Gray', value: '#6b7280' },
                    { name: 'Red', value: '#dc2626' },
                    { name: 'Blue', value: '#2563eb' }
                  ].map((color) => (
                    <label key={color.name} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        className="rounded"
                        defaultChecked={product.colors.includes(color.name)}
                      />
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="text-sm">{color.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link href="/admin/products" className="flex-1">
              <Button variant="outline" className="w-full">Cancel</Button>
            </Link>
            <Button className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Update Product
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}