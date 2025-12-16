import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { stripe } from '@/lib/stripe';

interface PageProps {
    searchParams: Promise<{ session_id?: string }>;
}

async function SuccessContent({ sessionId }: { sessionId: string }) {
    let session = null;

    try {
        session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items'],
        });
    } catch (error) {
        console.error('Error retrieving session:', error);
    }

    const amountTotal = session?.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00';
    const itemCount = session?.line_items?.data?.length || 0;

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <Card className="w-full max-w-md">
                <CardContent className="pt-8 pb-6 text-center space-y-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-green-600">Payment Successful!</h1>
                        <p className="text-muted-foreground">
                            Thank you for your purchase. Your order has been confirmed.
                        </p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Items</span>
                            <span className="font-medium">{itemCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Paid</span>
                            <span className="font-semibold text-lg">RM {amountTotal}</span>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        A confirmation email has been sent to your email address.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Link href="/user/orders" className="flex-1">
                            <Button className="w-full" variant="default">
                                <Package className="w-4 h-4 mr-2" />
                                View Orders
                            </Button>
                        </Link>
                        <Link href="/user/products" className="flex-1">
                            <Button className="w-full" variant="outline">
                                Continue Shopping
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center">
            <div className="animate-pulse text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto" />
                <div className="h-6 w-48 bg-muted rounded mx-auto" />
                <div className="h-4 w-64 bg-muted rounded mx-auto" />
            </div>
        </div>
    );
}

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const sessionId = params.session_id;

    if (!sessionId) {
        redirect('/user/orders');
    }

    return (
        <Suspense fallback={<LoadingState />}>
            <SuccessContent sessionId={sessionId} />
        </Suspense>
    );
}
