"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    HelpCircle,
    ExternalLink,
    Package,
    TicketPercent,
    ArrowRight,
    CheckCircle,
    Zap,
} from "lucide-react";

export function StripeGuideSheet() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Stripe Guide
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-600" />
                        Stripe Product & Coupon Guide
                    </SheetTitle>
                    <SheetDescription>
                        Learn how to manage products and promotions via Stripe Dashboard
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Product Management */}
                    <section className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2 text-lg">
                            <Package className="w-5 h-5 text-primary" />
                            Product Management
                        </h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>
                                Products are automatically synced to Stripe when you create or
                                update them. Here's how it works:
                            </p>
                            <ul className="space-y-2 pl-4">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                    <span>
                                        <strong>Auto-sync:</strong> When you add a product here, it
                                        automatically creates a corresponding product and price in
                                        Stripe.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                    <span>
                                        <strong>Price updates:</strong> Price changes sync to Stripe
                                        as new price objects (Stripe versioning).
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                    <span>
                                        <strong>Stripe badge:</strong> Products with a blue "Stripe"
                                        badge are synced and ready for checkout.
                                    </span>
                                </li>
                            </ul>
                        </div>
                        <a
                            href="https://dashboard.stripe.com/products"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            View Products in Stripe
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </section>

                    <hr className="border-border" />

                    {/* Coupon Management */}
                    <section className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2 text-lg">
                            <TicketPercent className="w-5 h-5 text-primary" />
                            Coupon & Promotion Codes
                        </h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>
                                Coupons and promotion codes are managed directly in Stripe for
                                better control and analytics:
                            </p>
                            <ul className="space-y-2 pl-4">
                                <li className="flex items-start gap-2">
                                    <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                    <span>
                                        <strong>Coupons:</strong> Define the discount (percentage or
                                        fixed amount, duration, limits).
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                    <span>
                                        <strong>Promotion Codes:</strong> Create shareable codes
                                        tied to coupons (e.g., SAVE20, WELCOME10).
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                            <p className="text-sm font-medium">Quick Steps:</p>
                            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                                <li>Go to Stripe Dashboard → Products → Coupons</li>
                                <li>Click "Create coupon" and set discount details</li>
                                <li>
                                    Create a Promotion Code with a memorable code name
                                </li>
                                <li>
                                    Customers can apply the code at checkout automatically
                                </li>
                            </ol>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <a
                                href="https://dashboard.stripe.com/coupons"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 font-medium"
                            >
                                Manage Coupons
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <a
                                href="https://dashboard.stripe.com/promotion_codes"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 text-sm border border-input bg-background px-4 py-2 rounded-md hover:bg-accent font-medium"
                            >
                                Promotion Codes
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </section>

                    <hr className="border-border" />

                    {/* Tips */}
                    <section className="space-y-3">
                        <h3 className="font-semibold text-lg">💡 Pro Tips</h3>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li>
                                • Use <strong>first_time_transaction</strong> restriction for
                                new customer discounts
                            </li>
                            <li>
                                • Set <strong>max redemptions</strong> to limit coupon usage
                            </li>
                            <li>
                                • Track coupon performance in Stripe's analytics dashboard
                            </li>
                            <li>
                                • Use <strong>minimum order</strong> amounts to protect margins
                            </li>
                        </ul>
                    </section>

                    <hr className="border-border" />

                    {/* Helpful Links */}
                    <section className="space-y-3">
                        <h3 className="font-semibold text-lg">📚 Helpful Resources</h3>
                        <div className="flex flex-col gap-2">
                            <a
                                href="https://stripe.com/docs/products-prices/overview"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Stripe Products & Prices Guide
                            </a>
                            <a
                                href="https://stripe.com/docs/billing/subscriptions/coupons"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Stripe Coupons Documentation
                            </a>
                            <a
                                href="https://dashboard.stripe.com/test/logs"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                View API Logs (for debugging)
                            </a>
                        </div>
                    </section>
                </div>
            </SheetContent>
        </Sheet>
    );
}
