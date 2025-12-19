import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { revalidatePath } from "next/cache";

/**
 * Cart Router
 * 
 * Handles cart management operations. 
 * NOTE: Order creation is handled ONLY by Stripe webhook.
 */
export const cartRouter = router({
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
      const { supabase, user } = ctx;

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("variant_id", input.variantId)
        .single();

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + input.quantity })
          .eq("id", existingItem.id);

        if (error) return { success: false, error: error.message };
      } else {
        // Insert new item
        const { error } = await supabase.from("cart_items").insert({
          user_id: user.id,
          variant_id: input.variantId,
          quantity: input.quantity,
        });

        if (error) return { success: false, error: error.message };
      }

      revalidatePath("/user/cart");
      return { success: true };
    }),

  /**
   * Update cart item quantity
   */
  updateQuantity: protectedProcedure
    .input(
      z.object({
        cartItemId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, user } = ctx;

      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: input.quantity })
        .eq("id", input.cartItemId)
        .eq("user_id", user.id); // Ensure user owns this cart item

      if (error) return { success: false, error: error.message };

      revalidatePath("/user/cart");
      return { success: true };
    }),

  /**
   * Remove item from cart
   */
  removeItem: protectedProcedure
    .input(
      z.object({
        cartItemId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, user } = ctx;

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", input.cartItemId)
        .eq("user_id", user.id); // Ensure user owns this cart item

      if (error) return { success: false, error: error.message };

      revalidatePath("/user/cart");
      return { success: true };
    }),
});

