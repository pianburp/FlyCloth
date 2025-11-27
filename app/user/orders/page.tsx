import { getUserProfile } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageIcon, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

export default async function OrdersPage() {
  const profile = await getUserProfile();

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
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-muted-foreground">
          Track your order history and status
        </p>
      </div>

      <div className="space-y-6">
        {!orders || orders.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12">
                <PackageIcon className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No orders yet. Start shopping to place your first order!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(order.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusVariant(order.status) as "default" | "secondary" | "destructive" | "outline"}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-t pt-4">
                    {order.order_items.map((item: any) => (
                      <div key={item.id} className="flex justify-between py-2">
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">{item.variant_info} x {item.quantity}</p>
                        </div>
                        <p className="font-medium">RM{item.unit_price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4 flex justify-between font-bold">
                    <span>Total</span>
                    <span>RM{order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
