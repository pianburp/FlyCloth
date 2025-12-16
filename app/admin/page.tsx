import { getCachedUserProfile } from "@/lib/rbac";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShirtIcon, PackageIcon, DollarSignIcon, UsersIcon } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch dashboard data in parallel (including profile)
  const [
    profile,
    { count: productsCount },
    { count: ordersCount },
    { count: usersCount },
    { data: revenueData },
    { data: recentOrders },
    { data: allOrderItems }
  ] = await Promise.all([
    getCachedUserProfile(),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total_amount"),
    supabase.from("orders")
      .select(`
        id,
        total_amount,
        status,
        created_at,
        order_items (
          product_name,
          quantity
        )
      `)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("order_items").select("product_name, quantity, unit_price")
  ]);

  const totalRevenue = revenueData?.reduce((acc, order) => acc + (Number(order.total_amount) || 0), 0) || 0;

  // Calculate top products
  const productStats: Record<string, { sold: number; revenue: number }> = {};

  allOrderItems?.forEach((item) => {
    if (!productStats[item.product_name]) {
      productStats[item.product_name] = { sold: 0, revenue: 0 };
    }
    productStats[item.product_name].sold += item.quantity;
    productStats[item.product_name].revenue += item.quantity * Number(item.unit_price);
  });

  const topProducts = Object.entries(productStats)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Welcome back, {profile?.full_name} - Manage your FlyCloth store
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Products
            </CardTitle>
            <ShirtIcon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">{productsCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Orders
            </CardTitle>
            <PackageIcon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">{ordersCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Revenue
            </CardTitle>
            <DollarSignIcon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold">RM{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Active Users
            </CardTitle>
            <UsersIcon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">{usersCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders?.map((order) => (
                <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 last:border-0 gap-1 sm:gap-4">
                  <div>
                    <p className="font-medium text-sm sm:text-base">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {order.order_items && order.order_items.length > 0
                        ? `${order.order_items[0].product_name}${order.order_items.length > 1 ? ` +${order.order_items.length - 1} more` : ''}`
                        : 'No items'}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-bold text-sm sm:text-base">RM{Number(order.total_amount).toFixed(2)}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground capitalize">{order.status}</p>
                  </div>
                </div>
              ))}
              {(!recentOrders || recentOrders.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No orders found</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best selling items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="flex items-center gap-3">
                    <ShirtIcon className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.sold} sold</p>
                    </div>
                  </div>
                  <p className="font-bold">RM{product.revenue.toFixed(2)}</p>
                </div>
              ))}
              {topProducts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No sales data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
