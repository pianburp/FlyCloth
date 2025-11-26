"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ShoppingCart, Check } from "lucide-react";
import { addToCart } from "./actions";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast"; 

interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number;
}

interface Variant {
  id: string;
  size: string;
  color: string;
  color_hex: string;
  price: number;
  stock_quantity: number;
}

interface ProductImage {
  storage_path: string;
  is_primary: boolean;
}

interface ProductDetailsClientProps {
  product: Product;
  variants: Variant[];
  images: ProductImage[];
}

export default function ProductDetailsClient({ product, variants, images }: ProductDetailsClientProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [mainImage, setMainImage] = useState(images.find(img => img.is_primary)?.storage_path || images[0]?.storage_path);

  const supabase = createClient();
  const { toast } = useToast();

  // Get unique colors and sizes
  const colors = Array.from(new Set(variants.map(v => v.color))).map(color => {
    const variant = variants.find(v => v.color === color);
    return { name: color, hex: variant?.color_hex };
  });
  
  const sizes = Array.from(new Set(variants.map(v => v.size)));

  // Find selected variant
  const selectedVariant = variants.find(
    v => v.color === selectedColor && v.size === selectedSize
  );

  const currentPrice = selectedVariant ? selectedVariant.price : product.base_price;
  const isOutOfStock = selectedVariant && selectedVariant.stock_quantity < 1;

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    
    setIsAdding(true);
    try {
      const result = await addToCart(selectedVariant.id, quantity);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error adding to cart",
          description: result.error,
        });
      } else {
        toast({
          title: "Added to cart",
          description: `${quantity} x ${product.name} (${selectedSize}, ${selectedColor}) added to your cart.`,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Please try again later.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return null;
    return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Image Gallery */}
      <div className="flex flex-col gap-4">
        <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center border">
          {mainImage ? (
            <img 
              src={getImageUrl(mainImage) || ''} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-muted-foreground">No Image</div>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button 
              key={idx}
              onClick={() => setMainImage(img.storage_path)}
              className={`w-20 h-20 rounded-md overflow-hidden border-2 flex-shrink-0 ${mainImage === img.storage_path ? 'border-primary' : 'border-transparent'}`}
            >
              <img 
                src={getImageUrl(img.storage_path) || ''} 
                alt={`View ${idx + 1}`} 
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl font-bold text-primary mt-2">${currentPrice}</p>
        </div>

        <div className="prose max-w-none text-muted-foreground">
          <p>{product.description}</p>
        </div>

        <div className="space-y-4">
          {/* Color Selection */}
          <div>
            <h3 className="font-medium mb-3">Color</h3>
            <div className="flex flex-wrap gap-3">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedColor === color.name 
                      ? 'border-primary ring-2 ring-primary ring-offset-2' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color.hex || '#eee' }}
                  title={color.name}
                >
                  {selectedColor === color.name && (
                    <Check className={`w-5 h-5 ${['white', '#ffffff', '#fff'].includes(color.hex?.toLowerCase() || '') ? 'text-black' : 'text-white'}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <h3 className="font-medium mb-3">Size</h3>
            <div className="flex flex-wrap gap-3">
              {sizes.map((size) => {
                // Check if this size is available for the selected color
                const isAvailable = !selectedColor || variants.some(v => v.color === selectedColor && v.size === size && v.stock_quantity > 0);
                
                return (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    onClick={() => setSelectedSize(size)}
                    disabled={!isAvailable}
                    className={`w-12 h-12 p-0 ${!isAvailable ? 'opacity-50' : ''}`}
                  >
                    {size}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <h3 className="font-medium mb-3">Quantity</h3>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                disabled={!!selectedVariant && quantity >= selectedVariant.stock_quantity}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Add to Cart */}
          <Button 
            className="w-full h-12 text-lg mt-4" 
            onClick={handleAddToCart}
            disabled={!selectedVariant || isOutOfStock || isAdding}
          >
            {isAdding ? (
              "Adding..."
            ) : isOutOfStock ? (
              "Out of Stock"
            ) : (
              <>
                <ShoppingCart className="mr-2 w-5 h-5" />
                Add to Cart
              </>
            )}
          </Button>
          
          {!selectedColor || !selectedSize ? (
            <p className="text-sm text-muted-foreground text-center">
              Please select a color and size
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
