"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Truck, Package, ExternalLink, Loader2, CreditCard, Printer } from "lucide-react";

interface OrderItem {
  id: string;
  product_name: string;
  variant_info: string;
  quantity: number;
  unit_price: number;
}

interface Shipment {
  id: string;
  easyparcel_order_no: string;
  parcel_no: string | null;
  awb: string | null;
  awb_label_url: string | null;
  tracking_url: string | null;
  courier_name: string;
  shipping_cost: number;
  payment_status: 'pending' | 'paid' | 'failed';
  collect_date: string | null;
  paid_at: string | null;
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
  shipment?: Shipment | null;
}

const ORDER_STATUSES = [
  'pending',
  'paid',
  'printing',
  'awaiting_shipment',
  'shipped',
  'delivered',
  'cancelled'
] as const;

type OrderStatus = typeof ORDER_STATUSES[number];

export default function OrderDetailsClient({ order }: { order: Order }) {
  const [status, setStatus] = useState(order.status);
  const [shipment, setShipment] = useState<Shipment | null>(order.shipment || null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreatingShipment, setIsCreatingShipment] = useState(false);
  const [isPayingShipment, setIsPayingShipment] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    // Require confirmation for destructive status changes
    const destructiveStatuses = ['cancelled', 'delivered'];
    if (destructiveStatuses.includes(newStatus)) {
      const confirmed = confirm(
        `Are you sure you want to change the order status to "${formatStatus(newStatus)}"?\n\n` +
        (newStatus === 'cancelled' ? 'This will restore stock and cannot be easily undone.' :
          'This marks the order as complete.')
      );
      if (!confirmed) return;
    }

    setIsUpdating(true);
    try {
      await trpc.orders.updateStatus.mutate({
        orderId: order.id,
        newStatus: newStatus as any,
      });
      setStatus(newStatus);
      toast({
        title: "Status Updated",
        description: `Order status changed to ${formatStatus(newStatus)}`,
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

  const handleCreateShipment = async () => {
    setIsCreatingShipment(true);
    try {
      const response = await fetch('/api/admin/shipments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create shipment');
      }

      toast({
        title: "Shipment Created",
        description: `EasyParcel order ${data.shipment.orderNo} created. Cost: RM${data.shipment.price}`,
      });

      // Refresh page to get updated shipment data
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create shipment",
        variant: "destructive",
      });
    } finally {
      setIsCreatingShipment(false);
    }
  };

  const handlePayShipment = async () => {
    setIsPayingShipment(true);
    try {
      const response = await fetch('/api/admin/shipments/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to pay shipment');
      }

      toast({
        title: "Shipment Paid & Confirmed",
        description: `Tracking: ${data.shipment.awb}. Order marked as shipped.`,
      });

      // Refresh page to get updated data
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to pay shipment",
        variant: "destructive",
      });
    } finally {
      setIsPayingShipment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "default";
      case "shipped": return "default";
      case "awaiting_shipment": return "secondary";
      case "printing": return "secondary";
      case "paid": return "outline";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const canCreateShipment = ['paid', 'printing'].includes(status) && !shipment;
  const canPayShipment = shipment && shipment.payment_status === 'pending';

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Order Details</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage order #{order.id.slice(0, 8)}
        </p>
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
                    : (order.shipping_address?.line1
                      ? `${order.shipping_address.name || ''}\n${order.shipping_address.line1}${order.shipping_address.line2 ? ', ' + order.shipping_address.line2 : ''}\n${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}`
                      : order.shipping_address?.address || order.user_profile?.address || "No address provided")}
                </p>
                <p className="font-medium mt-4">Payment Method:</p>
                <p className="text-muted-foreground capitalize">{order.payment_method || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Shipment Management Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Shipment
              </CardTitle>
              <CardDescription>
                {shipment ? 'Manage EasyParcel shipment' : 'Create shipment when ready to ship'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!shipment ? (
                <div className="text-center py-4">
                  {canCreateShipment ? (
                    <>
                      <p className="text-muted-foreground mb-4">
                        Ready to create shipment? Make sure the order is printed and QC passed.
                      </p>
                      <Button
                        onClick={handleCreateShipment}
                        disabled={isCreatingShipment}
                        className="gap-2"
                      >
                        {isCreatingShipment ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Package className="w-4 h-4" />
                        )}
                        Create Shipment
                      </Button>
                    </>
                  ) : (
                    <p className="text-muted-foreground">
                      {status === 'pending'
                        ? 'Order payment not confirmed yet'
                        : shipment
                          ? 'Shipment already created'
                          : 'Update status to Paid or Printing to create shipment'}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Shipment Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">EasyParcel Order</p>
                      <p className="font-medium">{shipment.easyparcel_order_no}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Courier</p>
                      <p className="font-medium">{shipment.courier_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Shipping Cost</p>
                      <p className="font-medium">RM{shipment.shipping_cost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payment Status</p>
                      <Badge variant={shipment.payment_status === 'paid' ? 'default' : shipment.payment_status === 'failed' ? 'destructive' : 'secondary'}>
                        {shipment.payment_status.charAt(0).toUpperCase() + shipment.payment_status.slice(1)}
                      </Badge>
                    </div>
                    {shipment.awb && (
                      <>
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Tracking Number (AWB)</p>
                          <p className="font-medium font-mono">{shipment.awb}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    {canPayShipment && (
                      <Button
                        onClick={handlePayShipment}
                        disabled={isPayingShipment}
                        className="gap-2"
                      >
                        {isPayingShipment ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                        Pay & Confirm Shipment
                      </Button>
                    )}

                    {shipment.awb_label_url && (
                      <Button variant="outline" asChild className="gap-2">
                        <a href={shipment.awb_label_url} target="_blank" rel="noopener noreferrer">
                          <Printer className="w-4 h-4" />
                          Print AWB Label
                        </a>
                      </Button>
                    )}

                    {shipment.tracking_url && (
                      <Button variant="outline" asChild className="gap-2">
                        <a href={shipment.tracking_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                          Track Shipment
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}
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
                  {formatStatus(status)}
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
                  {ORDER_STATUSES.map(s => (
                    <option key={s} value={s}>{formatStatus(s)}</option>
                  ))}
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
