import { getCachedUserProfile } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PackageIcon, Calendar, ArrowUpRight, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReviewDialog } from "./review-dialog";

export const dynamic = 'force-dynamic';

function getStatusStyle(status: string) {
  switch (status) {
    case 'delivered':
      return 'luxury-badge luxury-badge-success';
    case 'shipped':
      return 'luxury-badge luxury-badge-info';
    case 'processing':
      return 'luxury-badge luxury-badge-warning';
    case 'cancelled':
      return 'luxury-badge bg-destructive/10 text-destructive border border-destructive/20';
    default:
      return 'luxury-badge bg-muted text-muted-foreground border border-border';
  }
}

export default async function OrdersPage() {
  const profile = await getCachedUserProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  const supabase = await createClient();

  // Fetch orders with items
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
  }

  // Fetch user's existing reviews
  const { data: reviews } = await supabase
    .from('product_reviews')
    .select('id, product_id, order_id, rating, title, comment')
    .eq('user_id', profile.id);

  // Define review type
  type ReviewData = {
    id: string;
    product_id: string;
    order_id: string;
    rating: number;
    title: string | null;
    comment: string | null;
  };

  // Create a lookup map for reviews by order_id and product_id
  const reviewMap = new Map<string, ReviewData>();
  reviews?.forEach((review) => {
    const key = `${review.order_id}-${review.product_id}`;
    reviewMap.set(key, review as ReviewData);
  });

  return (
    <div className="flex flex-col gap-8 sm:gap-10 max-w-6xl mx-auto">
      {/* Luxury Page Header */}
      <div className="luxury-page-header">
        <h1>My Orders</h1>
        <p>Track and review your purchase history</p>
        <div className="gold-divider mt-6" />
      </div>

      <div className="space-y-5">
        {!orders || orders.length === 0 ? (
          <div className="luxury-card p-8">
            <div className="luxury-empty-state">
              <div className="icon-wrapper">
                <PackageIcon className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <p>Your order history is empty. Discover our collection and place your first order.</p>
              <Link href="/user">
                <Button variant="outline" className="mt-6 text-xs tracking-luxury uppercase">
                  Browse Collection
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="luxury-card overflow-hidden">
              {/* Order Header */}
              <div className="px-6 py-5 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-medium tracking-tight">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <span className={getStatusStyle(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-light flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="divide-y divide-border/30">
                {order.order_items.map((item: any) => {
                  // Check if user has reviewed this product for this order
                  const reviewKey = `${order.id}-${item.variant_id}`;
                  // We need product_id, but we only have variant_id in order_items
                  // For now, use a simplified approach - reviews are per product+order
                  const existingReview = reviews?.find(
                    r => r.order_id === order.id && item.product_name.includes(r.product_id.slice(0, 8))
                  );

                  // Simplified: find by matching order_id (since order_items don't have product_id)
                  const itemReview = Array.from(reviewMap.entries()).find(
                    ([key]) => key.startsWith(order.id)
                  )?.[1];

                  return (
                    <div key={item.id} className="px-6 py-4 flex flex-col sm:flex-row justify-between gap-2">
                      <div className="space-y-0.5 flex-1">
                        <p className="text-sm font-medium tracking-tight">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground font-light">
                          {item.variant_info} · Qty: {item.quantity}
                        </p>
                        {/* Show existing review rating */}
                        {itemReview && (
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${star <= itemReview.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`}
                              />
                            ))}
                            <span className="text-xs text-muted-foreground ml-1">Your review</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-medium">RM {item.unit_price.toFixed(2)}</p>
                        {/* Review button for delivered orders */}
                        {order.status === 'delivered' && (
                          <ReviewDialog
                            productId={item.variant_id} // Using variant_id as product reference
                            productName={item.product_name}
                            orderId={order.id}
                            existingReview={itemReview}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Total */}
              <div className="px-6 py-4 bg-muted/30 flex justify-between items-center">
                <span className="text-sm text-muted-foreground font-light">Total</span>
                <span className="text-base font-semibold">RM {order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

