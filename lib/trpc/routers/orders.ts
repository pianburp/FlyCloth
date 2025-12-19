import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import { revalidatePath } from "next/cache";

export const ordersRouter = router({
  /**
   * Update order status (admin only)
   */
  updateStatus: adminProcedure
    .input(
      z.object({
        orderId: z.string().uuid(),
        newStatus: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx;

      const { error } = await supabase
        .from("orders")
        .update({ status: input.newStatus })
        .eq("id", input.orderId);

      if (error) {
        throw new Error(error.message);
      }

      // If order is cancelled, restore stock
      if (input.newStatus === "cancelled") {
        // Fetch order items to restore stock
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("variant_id, quantity")
          .eq("order_id", input.orderId);

        if (orderItems) {
          await Promise.all(
            orderItems.map(async (item) => {
              await supabase.rpc('increment_stock', {
                p_variant_id: item.variant_id,
                p_amount: item.quantity,
              });
            })
          );
        }
      }

      revalidatePath("/admin/orders");
      revalidatePath(`/admin/orders/${input.orderId}`);
      
      return { success: true };
    }),
});
