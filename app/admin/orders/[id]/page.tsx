import { requireAdmin } from "@/lib/rbac";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OrderDetailsClient from "./order-details-client";

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

  const orderWithProfile = {
    ...order,
    user_profile: profile
  };

  return <OrderDetailsClient order={orderWithProfile} />;
}
