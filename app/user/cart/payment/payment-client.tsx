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
  CheckCircle, 
  XCircle, 
  Gift,
  Receipt,
  ShirtIcon
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createOrder } from "./actions";

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
  const [selectedCoupon, setSelectedCoupon] = useState("");
  const [customCoupon, setCustomCoupon] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<"success" | "failed" | null>(null);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: ""
  });
  const router = useRouter();

  const availableCoupons = [
    { code: "SAVE10", discount: 10, type: "percentage", description: "10% off your order" },
    { code: "NEWUSER", discount: 15, type: "percentage", description: "15% off for new customers" },
    { code: "SAVE5", discount: 5, type: "fixed", description: "$5 off your order" },
    { code: "FREESHIP", discount: 9.99, type: "shipping", description: "Free shipping" }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const baseShipping = subtotal > 50 ? 0 : 9.99;

  // Apply coupon discount
  let discount = 0;
  let shipping = baseShipping;
  const appliedCoupon = availableCoupons.find(c => c.code === selectedCoupon || c.code === customCoupon);
  
  if (appliedCoupon) {
    if (appliedCoupon.type === "percentage") {
      discount = subtotal * (appliedCoupon.discount / 100);
    } else if (appliedCoupon.type === "fixed") {
      discount = appliedCoupon.discount;
    } else if (appliedCoupon.type === "shipping") {
      shipping = 0;
    }
  }

  const total = subtotal - discount + tax + shipping;

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if card details are filled
    const isCardFilled = cardDetails.number && cardDetails.expiry && cardDetails.cvc && cardDetails.name;
    
    if (isCardFilled) {
      const result = await createOrder(
        cartItems,
        total,
        discount,
        { address: "123 Mock St, City, Country" }, // Mock address for simulation
        paymentMethod
      );

      if (result.success) {
        setPaymentResult("success");
        // Redirect to success page after 2 seconds
        setTimeout(() => {
          router.push("/user/orders");
        }, 2000);
      } else {
        console.error("Payment failed:", result.error);
        setPaymentResult("failed");
      }
    } else {
      setPaymentResult("failed");
    }
    
    setIsProcessing(false);
  };

  if (paymentResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        {paymentResult === "success" ? (
          <>
            <div className="text-green-600">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2 text-green-600">Payment Successful!</h1>
              <p className="text-muted-foreground mb-4">
                Your order has been confirmed. You will be redirected to your orders page.
              </p>
              <p className="text-sm text-muted-foreground">
                Order Total: ${total.toFixed(2)}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="text-red-600">
              <XCircle className="w-16 h-16 mx-auto mb-4" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2 text-red-600">Payment Failed</h1>
              <p className="text-muted-foreground mb-6">
                There was an issue processing your payment. Please try again.
              </p>
              <div className="flex gap-4">
                <Button onClick={() => setPaymentResult(null)}>
                  Try Again
                </Button>
                <Link href="/user/cart">
                  <Button variant="outline">Back to Cart</Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/user/cart">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground">
            Complete your purchase securely
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <div className="space-y-6">
          {/* Coupon Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Apply Coupon
              </CardTitle>
              <CardDescription>Choose a coupon or enter a custom code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Available Coupons */}
              <div className="space-y-2">
                <Label>Available Coupons</Label>
                <div className="grid grid-cols-1 gap-2">
                  {availableCoupons.map((coupon) => (
                    <label key={coupon.code} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <input
                        type="radio"
                        name="coupon"
                        value={coupon.code}
                        checked={selectedCoupon === coupon.code}
                        onChange={(e) => {
                          setSelectedCoupon(e.target.value);
                          setCustomCoupon("");
                        }}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">{coupon.code}</span>
                          <span className="text-sm text-green-600 font-medium">
                            {coupon.type === "percentage" ? `${coupon.discount}% OFF` :
                             coupon.type === "fixed" ? `$${coupon.discount} OFF` :
                             "FREE SHIPPING"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{coupon.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom Coupon */}
              <div className="space-y-2">
                <Label htmlFor="customCoupon">Or enter a custom code</Label>
                <div className="flex gap-2">
                  <Input
                    id="customCoupon"
                    placeholder="Enter coupon code"
                    value={customCoupon}
                    onChange={(e) => {
                      setCustomCoupon(e.target.value);
                      setSelectedCoupon("");
                    }}
                  />
                  <Button variant="outline" size="sm">Apply</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <CreditCard className="w-5 h-5" />
                  <span>Credit/Debit Card</span>
                </label>
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    checked={paymentMethod === "paypal"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="w-5 h-5 bg-blue-600 rounded"></div>
                  <span>PayPal</span>
                </label>
              </div>

              {paymentMethod === "card" && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input 
                        id="cardNumber" 
                        placeholder="1234 5678 9012 3456" 
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input 
                          id="expiry" 
                          placeholder="MM/YY" 
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input 
                          id="cvv" 
                          placeholder="123" 
                          value={cardDetails.cvc}
                          onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input 
                        id="cardName" 
                        placeholder="John Doe" 
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary & Invoice */}
        <div className="space-y-6">
          {/* Invoice Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Invoice Summary
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
                    <p className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Button */}
              <div className="pt-4">
                <Button 
                  onClick={handlePayment} 
                  disabled={isProcessing}
                  className="w-full" 
                  size="lg"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing Payment...
                    </div>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Pay ${total.toFixed(2)}
                    </>
                  )}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                <p>🔒 Your payment information is secure and encrypted</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
