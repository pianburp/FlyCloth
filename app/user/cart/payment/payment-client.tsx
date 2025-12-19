"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  CreditCard,
  Shield,
  Gift,
  Receipt,
  ShirtIcon,
  Loader2,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

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

interface PaymentClientProps {
  cartItems: CartItem[];
  userEmail: string;
}

export default function PaymentClient({ cartItems, userEmail }: PaymentClientProps) {
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle");
  const [promoDetails, setPromoDetails] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const baseShipping = subtotal > 50 ? 0 : 9.99;

  // Apply promo discount if valid
  let discount = 0;
  if (promoStatus === "valid" && promoDetails) {
    if (promoDetails.percentOff) {
      discount = subtotal * (promoDetails.percentOff / 100);
    } else if (promoDetails.amountOff) {
      discount = promoDetails.amountOff;
    }
  }

  const total = subtotal - discount + tax + baseShipping;

  // Validate promo code with Stripe
  const validatePromoCode = async () => {
    if (!promoCode.trim()) return;

    setPromoStatus("validating");
    try {
      const response = await fetch("/api/stripe/validate-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode }),
      });

      const data = await response.json();

      if (data.valid) {
        setPromoStatus("valid");
        setPromoDetails(data.coupon);
      } else {
        setPromoStatus("invalid");
        setPromoDetails(null);
      }
    } catch (err) {
      setPromoStatus("invalid");
      setPromoDetails(null);
    }
  };

  // Redirect to Stripe Checkout
  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);

    try {
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
          promoCode: promoStatus === "valid" ? promoCode : undefined,
        }),
      });

      const data = await response.json();

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
    }
  };

  return (
    <div className="flex flex-col gap-8 sm:gap-10 max-w-5xl mx-auto">
      {/* Luxury Page Header */}
      <div className="flex items-start gap-4">
        <Link href="/user/cart">
          <Button variant="ghost" size="icon" className="flex-shrink-0 hover:bg-muted">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="luxury-page-header mb-0">
          <span className="label">Secure Checkout</span>
          <h1>Complete Your Order</h1>
          <p>Review your items and proceed to secure payment</p>
        </div>
      </div>

      <div className="gold-divider" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Promo Code & Info */}
        <div className="space-y-6">
          {/* Promo Code */}
          <div className="luxury-card overflow-hidden">
            <div className="px-6 py-5 border-b border-border/40 flex items-center gap-3">
              <Gift className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm tracking-luxury uppercase text-muted-foreground">
                Promotion Code
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    if (promoStatus !== "idle") {
                      setPromoStatus("idle");
                      setPromoDetails(null);
                    }
                  }}
                  disabled={promoStatus === "validating"}
                  className="luxury-input text-sm"
                />
                <Button
                  variant="outline"
                  onClick={validatePromoCode}
                  disabled={!promoCode.trim() || promoStatus === "validating"}
                  className="text-xs tracking-luxury uppercase shrink-0"
                >
                  {promoStatus === "validating" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Apply"
                  )}
                </Button>
              </div>

              {promoStatus === "valid" && promoDetails && (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="font-light">
                    {promoDetails.percentOff
                      ? `${promoDetails.percentOff}% discount applied`
                      : `RM ${promoDetails.amountOff} discount applied`
                    }
                  </span>
                </div>
              )}

              {promoStatus === "invalid" && (
                <div className="flex items-center gap-2 text-destructive text-xs">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span className="font-light">Invalid or expired promo code</span>
                </div>
              )}

              <p className="text-xs text-muted-foreground/70 font-light">
                Promo codes can also be applied at Stripe checkout
              </p>
            </div>
          </div>

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
                  <div className="h-5 flex items-center justify-center mb-2">
                    <span className="text-xs font-semibold text-emerald-600">FPX</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-light">Online Banking</span>
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
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span className="font-light">Discount</span>
                    <span className="font-medium">−RM {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-light">Tax (8%)</span>
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

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                disabled={isProcessing || cartItems.length === 0}
                className="w-full h-14 text-xs tracking-luxury uppercase font-medium transition-all duration-300"
              >
                {isProcessing ? (
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
