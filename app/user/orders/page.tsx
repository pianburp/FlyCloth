import { getCachedUserProfile } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PackageIcon, Calendar, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="flex flex-col gap-8 sm:gap-10 max-w-6xl mx-auto">
      {/* Luxury Page Header */}
      <div className="luxury-page-header">
        <span className="label">Order History</span>
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
                {order.order_items.map((item: any) => (
                  <div key={item.id} className="px-6 py-4 flex flex-col sm:flex-row justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium tracking-tight">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground font-light">
                        {item.variant_info} · Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium">RM {item.unit_price.toFixed(2)}</p>
                  </div>
                ))}
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
