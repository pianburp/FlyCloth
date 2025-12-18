import { requireAdmin } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExportOrdersButton } from "./export-orders-button";

export const dynamic = 'force-dynamic';

function getStatusVariant(status: string) {
  switch (status) {
    case 'delivered':
      return 'default'; // Green/Primary
    case 'shipped':
      return 'secondary'; // Gray
    case 'processing':
      return 'outline'; // Outline
    case 'cancelled':
      return 'destructive'; // Red
    default:
      return 'secondary'; // Pending
  }
}

export default async function AdminOrdersPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/user");
  }

  const supabase = await createClient();
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (id)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Order Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View and manage customer orders
          </p>
        </div>
        <ExportOrdersButton orders={orders || []} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>Manage order status and fulfillment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!orders || orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No orders found.</p>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between border p-3 sm:p-4 rounded-lg gap-3 sm:gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-sm sm:text-base">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">User: {order.user_id.slice(0, 8)}...</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {order.order_items?.length || 0} item(s)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-sm sm:text-base">RM{order.total_amount.toFixed(2)}</p>
                      <Badge variant={getStatusVariant(order.status) as "default" | "secondary" | "destructive" | "outline"}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button variant="outline" size="sm" className="text-xs sm:text-sm">View Details</Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
