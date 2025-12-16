import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PaymentCancelPage() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <Card className="w-full max-w-md">
                <CardContent className="pt-8 pb-6 text-center space-y-6">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                        <XCircle className="w-10 h-10 text-orange-600" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold">Payment Cancelled</h1>
                        <p className="text-muted-foreground">
                            Your payment was cancelled. Don't worry, your cart items are still saved.
                        </p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">
                            If you experienced any issues during checkout, please try again or contact our support team.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Link href="/user/cart" className="flex-1">
                            <Button className="w-full" variant="default">
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Return to Cart
                            </Button>
                        </Link>
                        <Link href="/user/products" className="flex-1">
                            <Button className="w-full" variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Continue Shopping
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
