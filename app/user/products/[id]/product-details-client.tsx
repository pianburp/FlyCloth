"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ShoppingCart, Play } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
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
  fit: string;
  gsm?: number;
  price: number;
  stock_quantity: number;
}

interface ProductImage {
  storage_path: string;
  is_primary: boolean;
  media_type?: 'image' | 'video';
}

interface ProductDetailsClientProps {
  product: Product;
  variants: Variant[];
  images: ProductImage[];
}

// Helper to check if media is video
const isVideo = (media: ProductImage) => media.media_type === 'video';

export default function ProductDetailsClient({ product, variants, images }: ProductDetailsClientProps) {
  const [selectedFit, setSelectedFit] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [mainImage, setMainImage] = useState(images.find(img => img.is_primary)?.storage_path || images[0]?.storage_path);

  const supabase = useMemo(() => createClient(), []);
  const { toast } = useToast();

  // Get unique fits and sizes
  const fits = Array.from(new Set(variants.map(v => v.fit))).map(fit => {
    const fitLabels: Record<string, string> = {
      'slim': 'Slim Fit',
      'regular': 'Regular Fit',
      'oversize': 'Oversize Fit'
    };
    return { value: fit, label: fitLabels[fit] || fit };
  });

  const sizes = Array.from(new Set(variants.map(v => v.size)));

  // Find selected variant
  const selectedVariant = variants.find(
    v => v.fit === selectedFit && v.size === selectedSize
  );

  const currentPrice = selectedVariant ? selectedVariant.price : product.base_price;
  const isOutOfStock = selectedVariant && selectedVariant.stock_quantity < 1;

  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    setIsAdding(true);
    try {
      const result = await trpc.cart.addToCart.mutate({
        variantId: selectedVariant.id,
        quantity: quantity,
      });
      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Error adding to cart",
          description: result.error,
        });
      } else {
        toast({
          title: "Added to cart",
          description: `${quantity} x ${product.name} (${selectedSize}, ${fits.find(f => f.value === selectedFit)?.label}) added to your cart.`,
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

  const getMediaUrl = (path: string) => {
    if (!path) return null;
    return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Media Gallery */}
      <div className="flex flex-col gap-4">
        <div className="aspect-[3/4] bg-muted/30 overflow-hidden flex items-center justify-center">
          {mainImage ? (
            // Check if current main media is a video
            images.find(img => img.storage_path === mainImage)?.media_type === 'video' ? (
              <video
                src={getMediaUrl(mainImage) || ''}
                className="w-full h-full object-cover"
                controls
                autoPlay
                muted
                loop
              />
            ) : (
              <img
                src={getMediaUrl(mainImage) || ''}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            )
          ) : (
            <div className="text-muted-foreground/50 text-sm tracking-luxury uppercase">No Media</div>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((media, idx) => (
            <button
              key={idx}
              onClick={() => setMainImage(media.storage_path)}
              className={`relative w-20 h-24 overflow-hidden flex-shrink-0 transition-all duration-300 ${mainImage === media.storage_path
                ? 'ring-1 ring-foreground opacity-100'
                : 'opacity-60 hover:opacity-100'
                }`}
            >
              {isVideo(media) ? (
                <>
                  <video
                    src={getMediaUrl(media.storage_path) || ''}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                </>
              ) : (
                <img
                  src={getMediaUrl(media.storage_path) || ''}
                  alt={`View ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-6 lg:py-4">
        {/* Title & Price */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight">{product.name}</h1>
          <p className="text-xl sm:text-2xl font-medium">RM {currentPrice.toLocaleString()}</p>
        </div>

        {/* Description */}
        <div className="text-sm text-muted-foreground font-light leading-relaxed">
          <p>{product.description}</p>
        </div>

        <div className="gold-divider" />

        <div className="space-y-6">
          {/* Fit Selection */}
          <div>
            <h3 className="text-xs tracking-luxury uppercase text-muted-foreground mb-4">
              Fit {selectedFit && <span className="text-foreground ml-2">— {fits.find(f => f.value === selectedFit)?.label}</span>}
            </h3>
            <div className="flex flex-wrap gap-2">
              {fits.map((fit) => (
                <button
                  key={fit.value}
                  onClick={() => setSelectedFit(fit.value)}
                  className={`px-4 py-2 text-sm font-light border transition-all duration-300 ${selectedFit === fit.value
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-transparent text-foreground border-border hover:border-foreground'
                    }`}
                >
                  {fit.label}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <h3 className="text-xs tracking-luxury uppercase text-muted-foreground mb-4">
              Size {selectedSize && <span className="text-foreground ml-2">— {selectedSize}</span>}
            </h3>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => {
                const isAvailable = !selectedFit || variants.some(v => v.fit === selectedFit && v.size === size && v.stock_quantity > 0);

                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={!isAvailable}
                    className={`w-12 h-12 text-sm font-light border transition-all duration-300 ${selectedSize === size
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-transparent text-foreground border-border hover:border-foreground'
                      } ${!isAvailable ? 'opacity-30 cursor-not-allowed line-through' : ''}`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* GSM Info */}
          {selectedVariant?.gsm && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-xs tracking-luxury uppercase">Fabric Weight:</span>
              <span className="font-medium text-foreground">{selectedVariant.gsm} GSM</span>
              <span className="text-xs">
                {selectedVariant.gsm <= 150 ? '(Lightweight)' : selectedVariant.gsm <= 180 ? '(Standard)' : '(Heavyweight)'}
              </span>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="text-xs tracking-luxury uppercase text-muted-foreground mb-4">Quantity</h3>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 hover:bg-muted"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                disabled={!!selectedVariant && quantity >= selectedVariant.stock_quantity}
                className="w-10 h-10 hover:bg-muted"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="pt-2 space-y-3">
            <Button
              className="w-full h-14 text-xs tracking-luxury uppercase font-medium transition-all duration-300"
              onClick={handleAddToCart}
              disabled={!selectedVariant || isOutOfStock || isAdding}
            >
              {isAdding ? (
                "Adding to Cart..."
              ) : isOutOfStock ? (
                "Out of Stock"
              ) : (
                <>
                  <ShoppingCart className="mr-2 w-4 h-4" />
                  Add to Cart
                </>
              )}
            </Button>

            {!selectedFit || !selectedSize ? (
              <p className="text-xs text-muted-foreground text-center font-light">
                Please select a fit and size to continue
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
