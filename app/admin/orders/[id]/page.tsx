import { requireAdmin } from "@/lib/rbac";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OrderDetailsClient from "./order-details-client";

export const dynamic = 'force-dynamic';

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await requireAdmin();
  } catch {
    redirect("/user");
  }

  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('id', id)
    .single();

  if (error || !order) {
    console.error("Error fetching order:", error);
    redirect("/admin/orders");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', order.user_id)
    .single();

  // Fetch shipment if exists
  const { data: shipment } = await supabase
    .from('easyparcel_shipments')
    .select('*')
    .eq('order_id', id)
    .single();

  const orderWithProfile = {
    ...order,
    user_profile: profile,
    shipment: shipment || null,
  };

  return <OrderDetailsClient order={orderWithProfile} />;
}
