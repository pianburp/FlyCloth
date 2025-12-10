import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export const productsRouter = router({
  /**
   * Add item to cart
   */
  addToCart: protectedProcedure
    .input(
      z.object({
        variantId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = await createClient();

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", ctx.user.id)
        .eq("variant_id", input.variantId)
        .single();

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + input.quantity })
          .eq("id", existingItem.id);

        if (error) return { error: error.message };
      } else {
        // Insert new item
        const { error } = await supabase.from("cart_items").insert({
          user_id: ctx.user.id,
          variant_id: input.variantId,
          quantity: input.quantity,
        });

        if (error) return { error: error.message };
      }

      revalidatePath("/user/cart");
      return { success: true };
    }),
});
