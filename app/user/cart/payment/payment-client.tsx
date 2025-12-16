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
  color: string;
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
            color: item.color,
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
    <div className="flex flex-col gap-6 sm:gap-8 max-w-6xl mx-auto">
      <div className="flex items-start sm:items-center gap-4">
        <Link href="/user/cart">
          <Button variant="outline" size="icon" className="flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Checkout</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Complete your purchase securely with Stripe
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Left Column - Promo Code & Info */}
        <div className="space-y-6">
          {/* Promo Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Promotion Code
              </CardTitle>
              <CardDescription>
                Have a promo code? Enter it below or apply at checkout.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                />
                <Button
                  variant="outline"
                  onClick={validatePromoCode}
                  disabled={!promoCode.trim() || promoStatus === "validating"}
                >
                  {promoStatus === "validating" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Apply"
                  )}
                </Button>
              </div>

              {promoStatus === "valid" && promoDetails && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {promoDetails.percentOff
                      ? `${promoDetails.percentOff}% off applied!`
                      : `RM${promoDetails.amountOff} off applied!`
                    }
                  </span>
                </div>
              )}

              {promoStatus === "invalid" && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Invalid or expired promo code</span>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                💡 You can also enter promo codes directly at the Stripe checkout page
              </p>
            </CardContent>
          </Card>

          {/* Payment Methods Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Accepted Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center p-3 border rounded-lg">
                  <img
                    src="https://cdn.brandfetch.io/visa.com"
                    alt="Visa"
                    className="h-6 w-auto object-contain mb-1"
                  />
                  <span className="text-xs text-muted-foreground">Visa</span>
                </div>
                <div className="flex flex-col items-center p-3 border rounded-lg">
                  <img
                    src="https://cdn.brandfetch.io/mastercard.com"
                    alt="Mastercard"
                    className="h-6 w-auto object-contain mb-1"
                  />
                  <span className="text-xs text-muted-foreground">Mastercard</span>
                </div>
                <div className="flex flex-col items-center p-3 border rounded-lg">
                  <div className="h-6 flex items-center justify-center mb-1">
                    <span className="text-sm font-bold text-green-600">FPX</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Online Banking</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Secure payments powered by Stripe
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Items ({cartItems.length})</h4>
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b last:border-b-0">
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShirtIcon className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.size} • {item.color} • Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-sm">RM{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>RM{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-RM{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Tax (8%)</span>
                  <span>RM{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{baseShipping === 0 ? 'Free' : `RM${baseShipping.toFixed(2)}`}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Estimated Total</span>
                  <span>RM{total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Final amount may vary based on shipping address
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Checkout Button */}
              <div className="pt-4">
                <Button
                  onClick={handleCheckout}
                  disabled={isProcessing || cartItems.length === 0}
                  className="w-full"
                  size="lg"
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
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center space-y-1">
                <p>🔒 You will be redirected to Stripe's secure checkout</p>
                <p>Your payment details are never stored on our servers</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
