"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

interface OrderItem {
  id: string;
  product_name: string;
  variant_info: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  shipping_address: any;
  payment_method: string;
  order_items: OrderItem[];
  user_profile?: {
    full_name: string | null;
    phone: string | null;
    address: string | null;
  };
}

export default function OrderDetailsClient({ order }: { order: Order }) {
  const [status, setStatus] = useState(order.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await trpc.orders.updateStatus.mutate({
        orderId: order.id,
        newStatus: newStatus as "pending" | "processing" | "shipped" | "delivered" | "cancelled",
      });
      setStatus(newStatus);
      toast({
        title: "Status Updated",
        description: `Order status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "default";
      case "shipped": return "secondary";
      case "processing": return "outline";
      case "cancelled": return "destructive";
      default: return "secondary"; // pending
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Link href="/admin/orders">
          <Button variant="outline" size="icon" className="w-8 h-8 sm:w-10 sm:h-10">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Order Details</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage order #{order.id.slice(0, 8)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4 last:border-0 last:pb-0 gap-1 sm:gap-4">
                    <div>
                      <p className="font-medium text-sm sm:text-base">{item.product_name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{item.variant_info}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-medium text-xs sm:text-sm">RM{item.unit_price.toFixed(2)} x {item.quantity}</p>
                      <p className="font-bold text-sm sm:text-base">RM{(item.unit_price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between pt-4 border-t font-bold text-base sm:text-lg">
                  <span>Total</span>
                  <span>RM{order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Info */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">Address:</p>
                <p className="text-muted-foreground">
                  {typeof order.shipping_address === 'string'
                    ? order.shipping_address
                    : (order.shipping_address?.address || "No address provided")}
                </p>
                <p className="font-medium mt-4">Payment Method:</p>
                <p className="text-muted-foreground capitalize">{order.payment_method || "N/A"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>Update the current status of this order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Current Status:</span>
                <Badge variant={getStatusColor(status) as any}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Change Status</label>
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={isUpdating}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.user_profile && (
                  <>
                    <p className="text-sm text-muted-foreground mt-2">Name:</p>
                    <p>{order.user_profile.full_name || "N/A"}</p>

                    <p className="text-sm text-muted-foreground mt-2">Phone:</p>
                    <p>{order.user_profile.phone || "N/A"}</p>

                    <p className="text-sm text-muted-foreground mt-2">Address:</p>
                    <p className="whitespace-pre-wrap">{order.user_profile.address || "N/A"}</p>
                  </>
                )}

                <p className="text-sm text-muted-foreground mt-2">Order Date:</p>
                <p>{new Date(order.created_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
