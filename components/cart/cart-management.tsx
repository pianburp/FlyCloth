"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CartItemComponent } from "./cart-item";
import Link from "next/link";
import { ShoppingCart, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  name: string;
  price: number;
  size: string;
  variantInfo: string;
  quantity: number;
  stockQuantity: number;
  image: string;
}

interface StoreSettings {
  shipping_fee: number;
  free_shipping_threshold: number;
  tax_rate: number;
}

interface CartManagementProps {
  initialItems: CartItem[];
  userId: string;
  storeSettings: StoreSettings;
}

export function CartManagement({ initialItems, userId, storeSettings }: CartManagementProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialItems);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    setCartItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    // Get variant IDs from cart items for stock monitoring
    const variantIds = cartItems.map(item => item.variantId);

    const channel = supabase
      .channel('cart_and_stock_updates')
      // Subscribe to cart item changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          router.refresh();
        }
      )
      // Subscribe to stock changes for items in cart
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'product_variants',
        },
        (payload) => {
          // Only refresh if the updated variant is in our cart
          if (variantIds.includes(payload.new?.id)) {
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router, userId, cartItems]);

  const handleQuantityChange = async (id: string, quantity: number) => {
    // Optimistic update
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', id);

    if (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (id: string) => {
    // Optimistic update
    setCartItems(items => items.filter(item => item.id !== id));

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing item:', error);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = storeSettings.tax_rate;
  const tax = subtotal * taxRate;
  const shipping = subtotal > storeSettings.free_shipping_threshold ? 0 : storeSettings.shipping_fee;
  const total = subtotal + tax + shipping;

  // Stock validation
  const outOfStockItems = cartItems.filter(item => item.stockQuantity === 0);
  const overStockItems = cartItems.filter(item => item.quantity > item.stockQuantity && item.stockQuantity > 0);
  const hasStockIssues = outOfStockItems.length > 0 || overStockItems.length > 0;

  if (cartItems.length === 0) {
    return (
      <div className="luxury-card p-8">
        <div className="luxury-empty-state">
          <div className="icon-wrapper">
            <ShoppingCart className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <p>Your cart awaits. Explore our collection to discover your next favorite piece.</p>
          <Link href="/user">
            <Button variant="outline" className="mt-6 text-xs tracking-luxury uppercase">
              Browse Collection
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        <div className="luxury-card overflow-hidden">
          <div className="px-6 py-5 border-b border-border/40">
            <h3 className="text-sm tracking-luxury uppercase text-muted-foreground">
              Items ({cartItems.length})
            </h3>
          </div>
          <div className="divide-y divide-border/30">
            {cartItems.map((item) => (
              <CartItemComponent
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="space-y-4">
        <div className="luxury-card overflow-hidden">
          <div className="px-6 py-5 border-b border-border/40">
            <h3 className="text-sm tracking-luxury uppercase text-muted-foreground">
              Order Summary
            </h3>
          </div>
          <div className="p-6 space-y-5">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-light">Subtotal</span>
                <span className="font-medium">RM {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-light">Tax ({(taxRate * 100).toFixed(0)}%)</span>
                <span className="font-medium">RM {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-light">Shipping</span>
                <span className="font-medium">{shipping === 0 ? 'Complimentary' : `RM ${shipping.toFixed(2)}`}</span>
              </div>
              <div className="gold-divider my-4" />
              <div className="flex justify-between text-base">
                <span className="font-medium">Total</span>
                <span className="font-semibold">RM {total.toFixed(2)}</span>
              </div>
            </div>

            {hasStockIssues ? (
              <div className="space-y-2">
                <Button
                  disabled
                  className="w-full h-12 text-xs tracking-luxury uppercase font-medium opacity-50 cursor-not-allowed"
                >
                  Proceed to Checkout
                </Button>
                <div className="flex items-center justify-center gap-2 text-amber-500 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>
                    {outOfStockItems.length > 0
                      ? `${outOfStockItems.length} item(s) out of stock`
                      : `${overStockItems.length} item(s) exceed available stock`}
                  </span>
                </div>
              </div>
            ) : (
              <Link href="/user/cart/payment" className="block">
                <Button className="w-full h-12 text-xs tracking-luxury uppercase font-medium bg-primary hover:bg-primary/90 transition-all duration-300">
                  Proceed to Checkout
                </Button>
              </Link>
            )}

            {shipping > 0 && (
              <p className="text-xs text-center text-muted-foreground font-light">
                Add RM {(storeSettings.free_shipping_threshold - subtotal).toFixed(2)} more for complimentary shipping
              </p>
            )}
          </div>
        </div>


      </div>
    </div>
  );
}