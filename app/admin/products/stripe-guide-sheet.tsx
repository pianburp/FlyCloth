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
    Lightbulb,
    BookOpen,
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
                    <SheetTitle>Stripe Integration Guide</SheetTitle>
                    <SheetDescription>
                        How products and coupons work with Stripe
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 p-4">
                    {/* Product Sync - Step by Step */}
                    <section className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2 text-lg">
                            <Package className="w-5 h-5 text-primary" />
                            How Product Sync Works
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Products are created here in the admin panel and automatically synced to Stripe (not the other way around).
                        </p>
                        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                            <p className="text-sm font-medium">Step-by-Step Process:</p>
                            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                                <li>Go to <strong>Admin Panel → Products → Add New Product</strong></li>
                                <li>Fill in product details (name, price, SKU, images, etc.)</li>
                                <li>Ensure <strong>"Create in Stripe"</strong> checkbox is enabled</li>
                                <li>Click <strong>Save Product</strong></li>
                                <li>The product is saved to your database first</li>
                                <li>Then it automatically creates a Product and Price in Stripe</li>
                                <li>Stripe IDs are saved back to your database</li>
                                <li>Product displays a blue <strong>"Stripe"</strong> badge when synced</li>
                            </ol>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p><strong>Note:</strong> Price changes create new Stripe Price objects (Stripe versioning). The old price is archived automatically.</p>
                        </div>
                        <a
                            href="https://dashboard.stripe.com/products"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            View Products in Stripe Dashboard
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </section>

                    <hr className="border-border" />

                    {/* Coupon Creation - Step by Step */}
                    <section className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2 text-lg">
                            <TicketPercent className="w-5 h-5 text-primary" />
                            Creating Coupons in Stripe
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Coupons and promotion codes are managed directly in the Stripe Dashboard for better control and analytics.
                        </p>

                        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                            <p className="text-sm font-medium">Step 1: Create a Coupon</p>
                            <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                                <li>Go to <strong>Stripe Dashboard → Products → Coupons</strong></li>
                                <li>Click <strong>"+ Create coupon"</strong></li>
                                <li>Choose discount type:
                                    <ul className="ml-6 mt-1 space-y-1 list-disc">
                                        <li><strong>Percentage off</strong> (e.g., 20% off)</li>
                                        <li><strong>Fixed amount off</strong> (e.g., RM10 off)</li>
                                    </ul>
                                </li>
                                <li>Set duration (once, repeating, or forever)</li>
                                <li>Optionally set redemption limits and expiry date</li>
                                <li>Click <strong>"Create coupon"</strong></li>
                            </ol>
                        </div>

                        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                            <p className="text-sm font-medium">Step 2: Create a Promotion Code</p>
                            <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                                <li>After creating a coupon, click <strong>"+ Add promotion code"</strong></li>
                                <li>Enter a memorable code (e.g., <strong>SAVE20</strong>, <strong>WELCOME10</strong>)</li>
                                <li>Optionally set:
                                    <ul className="ml-6 mt-1 space-y-1 list-disc">
                                        <li>Maximum redemptions</li>
                                        <li>First-time customer only</li>
                                        <li>Minimum order amount</li>
                                        <li>Expiry date</li>
                                    </ul>
                                </li>
                                <li>Click <strong>"Create"</strong></li>
                                <li>Share the code with customers - they can apply it at checkout</li>
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
                        <h3 className="font-semibold flex items-center gap-2 text-lg">
                            <Lightbulb className="w-5 h-5 text-primary" />
                            Tips
                        </h3>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li>
                                Use <strong>first_time_transaction</strong> restriction for welcome discounts
                            </li>
                            <li>
                                Set <strong>max redemptions</strong> to create limited-time offers
                            </li>
                            <li>
                                Set <strong>minimum order amounts</strong> to protect margins
                            </li>
                            <li>
                                Track coupon performance in Stripe&apos;s analytics dashboard
                            </li>
                        </ul>
                    </section>

                    <hr className="border-border" />

                    {/* Helpful Links */}
                    <section className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2 text-lg">
                            <BookOpen className="w-5 h-5 text-primary" />
                            Documentation
                        </h3>
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
                                API Logs (for debugging)
                            </a>
                        </div>
                    </section>
                </div>
            </SheetContent>
        </Sheet>
    );
}
