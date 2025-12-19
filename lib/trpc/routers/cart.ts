import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { createClient } from "@/lib/supabase/server";

export const cartRouter = router({
  /**
   * Create a new order from cart items
   */
  createOrder: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            variantId: z.string(),
            name: z.string(),
            variantInfo: z.string(),
            size: z.string(),
            quantity: z.number().int().positive(),
            price: z.number().positive(),
          })
        ),
        totalAmount: z.number().positive(),
        discountAmount: z.number().min(0),
        shippingAddress: z.object({
          fullName: z.string(),
          phone: z.string(),
          address: z.string(),
        }),
        paymentMethod: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = await createClient();

      // 1. Create Order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: ctx.user.id,
          status: "pending",
          total_amount: input.totalAmount,
          discount_amount: input.discountAmount,
          shipping_address: input.shippingAddress,
          payment_method: input.paymentMethod,
        })
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError);
        return { success: false, error: orderError.message };
      }

      // 2. Create Order Items
      const orderItems = input.items.map((item) => ({
        order_id: order.id,
        variant_id: item.variantId,
        product_name: item.name,
        variant_info: `${item.size} / ${item.variantInfo}`,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Error creating order items:", itemsError);
        return { success: false, error: itemsError.message };
      }

      // 3. Update Stock
      await Promise.all(
        input.items.map(async (item) => {
          const { data: variant } = await supabase
            .from("product_variants")
            .select("stock_quantity")
            .eq("id", item.variantId)
            .single();

          if (variant) {
            const newStock = Math.max(0, variant.stock_quantity - item.quantity);
            const { error: updateStockError } = await supabase
              .from("product_variants")
              .update({ stock_quantity: newStock })
              .eq("id", item.variantId);

            if (updateStockError) {
              console.error(
                `Error updating stock for variant ${item.variantId}:`,
                updateStockError
              );
            }
          }
        })
      );

      // 4. Clear Cart
      const { error: clearCartError } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", ctx.user.id);

      if (clearCartError) {
        console.error("Error clearing cart:", clearCartError);
      }

      return { success: true, orderId: order.id };
    }),
});
