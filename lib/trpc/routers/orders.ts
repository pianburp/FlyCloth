import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import { createClient } from "@/lib/supabase/server";
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
    .mutation(async ({ input }) => {
      const supabase = await createClient();

      const { error } = await supabase
        .from("orders")
        .update({ status: input.newStatus })
        .eq("id", input.orderId);

      if (error) {
        throw new Error(error.message);
      }

      revalidatePath("/admin/orders");
      revalidatePath(`/admin/orders/${input.orderId}`);
      
      return { success: true };
    }),
});
