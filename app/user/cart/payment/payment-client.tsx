"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Shield,
  Receipt,
  ShirtIcon,
  Loader2,
  ExternalLink,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface CartValidationIssue {
  variantId: string;
  productName: string;
  reason: 'OUT_OF_STOCK' | 'INSUFFICIENT_STOCK';
  requestedQuantity: number;
  availableStock: number;
}

interface CartItem {
  id: string;
  variantId: string;
  name: string;
  price: number;
  size: string;
  variantInfo: string;
  quantity: number;
  image: string;
}

interface StoreSettings {
  shipping_fee: number;
  free_shipping_threshold: number;
  tax_rate: number;
}

interface PaymentClientProps {
  cartItems: CartItem[];
  userEmail: string;
  storeSettings: StoreSettings;
}

export default function PaymentClient({ cartItems, userEmail, storeSettings }: PaymentClientProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationIssues, setValidationIssues] = useState<CartValidationIssue[]>([]);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = storeSettings.tax_rate;
  const tax = subtotal * taxRate;
  const baseShipping = subtotal > storeSettings.free_shipping_threshold ? 0 : storeSettings.shipping_fee;
  const total = subtotal + tax + baseShipping;

  // Redirect to Stripe Checkout
  const handleCheckout = async () => {
    setIsProcessing(true);
    setIsValidating(true);
    setError(null);
    setValidationIssues([]);

    try {
      // Step 1: Validate cart stock levels (Soft Gate)
      const validationResponse = await fetch('/api/cart/validate');
      const validationData = await validationResponse.json();
      setIsValidating(false);

      if (!validationData.valid) {
        setValidationIssues(validationData.issues);
        setIsProcessing(false);
        return;
      }

      // Step 2: Create Stripe checkout session
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: cartItems.map(item => ({
            variantId: item.variantId,
            name: item.name,
            variantInfo: item.variantInfo,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      const data = await response.json();

      // Handle hard gate stock validation failure (409 Conflict)
      if (response.status === 409 && data.code === 'INSUFFICIENT_STOCK') {
        const issues: CartValidationIssue[] = data.issues.map((issue: any) => ({
          variantId: issue.variantId,
          productName: issue.productName,
          reason: issue.available === 0 ? 'OUT_OF_STOCK' : 'INSUFFICIENT_STOCK',
          requestedQuantity: issue.requested,
          availableStock: issue.available,
        }));
        setValidationIssues(issues);
        setIsProcessing(false);
        return;
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to create checkout session");
        setIsProcessing(false);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setIsProcessing(false);
      setIsValidating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 sm:gap-10 max-w-5xl mx-auto">
      {/* Luxury Page Header */}
      <div className="luxury-page-header">
        <span className="label">Secure Checkout</span>
        <h1>Complete Your Order</h1>
        <p>Review your items and proceed to secure payment</p>
      </div>

      <div className="gold-divider" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Payment Info */}
        <div className="space-y-6">

          {/* Payment Methods Info */}
          <div className="luxury-card overflow-hidden">
            <div className="px-6 py-5 border-b border-border/40 flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm tracking-luxury uppercase text-muted-foreground">
                Accepted Payment Methods
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center p-4 border border-border/40 transition-colors hover:bg-muted/30">
                  <img
                    src="https://cdn.brandfetch.io/visa.com"
                    alt="Visa"
                    className="h-5 w-auto object-contain mb-2"
                  />
                  <span className="text-[10px] text-muted-foreground font-light">Visa</span>
                </div>
                <div className="flex flex-col items-center p-4 border border-border/40 transition-colors hover:bg-muted/30">
                  <img
                    src="https://cdn.brandfetch.io/mastercard.com"
                    alt="Mastercard"
                    className="h-5 w-auto object-contain mb-2"
                  />
                  <span className="text-[10px] text-muted-foreground font-light">Mastercard</span>
                </div>
                <div className="flex flex-col items-center p-4 border border-border/40 transition-colors hover:bg-muted/30">
                  <img
                    src="https://cdn.brandfetch.io/grab.com"
                    alt="GrabPay"
                    className="h-5 w-auto object-contain mb-2"
                  />
                  <span className="text-[10px] text-muted-foreground font-light">GrabPay</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
                <Shield className="w-3 h-3" />
                <span className="font-light">Secured by Stripe</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          <div className="luxury-card overflow-hidden">
            <div className="px-6 py-5 border-b border-border/40 flex items-center gap-3">
              <Receipt className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm tracking-luxury uppercase text-muted-foreground">
                Order Summary
              </h3>
            </div>
            <div className="p-6 space-y-5">
              {/* Items */}
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground font-light">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </p>
                <div className="divide-y divide-border/30">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="w-14 h-16 bg-muted/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShirtIcon className="w-5 h-5 text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="text-sm font-medium tracking-tight truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground font-light">
                          {item.size} · {item.variantInfo} · Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium">RM {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="gold-divider" />

              {/* Pricing */}
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
                  <span className="font-medium">{baseShipping === 0 ? 'Complimentary' : `RM ${baseShipping.toFixed(2)}`}</span>
                </div>
                <div className="gold-divider my-4" />
                <div className="flex justify-between text-base">
                  <span className="font-medium">Estimated Total</span>
                  <span className="font-semibold">RM {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 text-xs font-light">
                  {error}
                </div>
              )}

              {/* Validation Issues */}
              {validationIssues.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-3 space-y-3">
                  <div className="flex items-center gap-2 text-amber-500 text-xs font-medium">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Stock Availability Issues</span>
                  </div>
                  <div className="space-y-2">
                    {validationIssues.map((issue) => (
                      <div key={issue.variantId} className="text-xs text-muted-foreground">
                        <span className="font-medium">{issue.productName}</span>:{' '}
                        {issue.reason === 'OUT_OF_STOCK'
                          ? 'Out of stock'
                          : `Only ${issue.availableStock} available (requested ${issue.requestedQuantity})`}
                      </div>
                    ))}
                  </div>
                  <Link href="/user/cart">
                    <Button variant="outline" size="sm" className="w-full text-xs mt-2">
                      <ArrowLeft className="w-3 h-3 mr-2" />
                      Return to Cart
                    </Button>
                  </Link>
                </div>
              )}

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                disabled={isProcessing || cartItems.length === 0 || validationIssues.length > 0}
                className="w-full h-14 text-xs tracking-luxury uppercase font-medium transition-all duration-300"
              >
                {isValidating ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Validating cart...
                  </div>
                ) : isProcessing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redirecting to Stripe...
                  </div>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Proceed to Secure Checkout
                    <ExternalLink className="w-3.5 h-3.5 ml-2" />
                  </>
                )}
              </Button>

              <div className="text-[10px] text-muted-foreground/70 text-center space-y-1 font-light">
                <p>You will be redirected to Stripe's secure checkout</p>
                <p>Your payment details are never stored on our servers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
