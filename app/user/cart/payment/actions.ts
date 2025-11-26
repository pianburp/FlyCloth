'use server'

import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/rbac";

export async function createOrder(
  items: any[],
  totalAmount: number,
  discountAmount: number,
  shippingAddress: any,
  paymentMethod: string
) {
  const profile = await getUserProfile();
  if (!profile) {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = await createClient();

  // 1. Create Order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: profile.id,
      status: 'pending',
      total_amount: totalAmount,
      discount_amount: discountAmount,
      shipping_address: shippingAddress,
      payment_method: paymentMethod
    })
    .select()
    .single();

  if (orderError) {
    console.error("Error creating order:", orderError);
    return { success: false, error: orderError.message };
  }

  // 2. Create Order Items
  const orderItems = items.map((item: any) => ({
    order_id: order.id,
    variant_id: item.variantId,
    product_name: item.name,
    variant_info: `${item.color} / ${item.size}`,
    quantity: item.quantity,
    unit_price: item.price
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error("Error creating order items:", itemsError);
    return { success: false, error: itemsError.message };
  }

  // 3. Clear Cart
  const { error: clearCartError } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', profile.id);

  if (clearCartError) {
    console.error("Error clearing cart:", clearCartError);
  }

  return { success: true, orderId: order.id };
}
