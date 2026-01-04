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
        quantity: z.number().int().positive().max(10, 'Maximum 10 items per variant'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, user } = ctx;
      
      const MAX_QUANTITY_PER_ITEM = 10;
      const MAX_CART_ITEMS = 50;

      // Validate stock availability
      const { data: variant } = await supabase
        .from("product_variants")
        .select("stock_quantity, is_active")
        .eq("id", input.variantId)
        .single();
      
      if (!variant) {
        return { success: false, error: "Product variant not found" };
      }
      
      if (!variant.is_active) {
        return { success: false, error: "This product is no longer available" };
      }

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("variant_id", input.variantId)
        .single();

      const newQuantity = existingItem 
        ? existingItem.quantity + input.quantity 
        : input.quantity;
      
      // Validate against stock
      if (newQuantity > variant.stock_quantity) {
        return { 
          success: false, 
          error: `Only ${variant.stock_quantity} items available in stock` 
        };
      }
      
      // Validate against max per item
      if (newQuantity > MAX_QUANTITY_PER_ITEM) {
        return { 
          success: false, 
          error: `Maximum ${MAX_QUANTITY_PER_ITEM} items allowed per product` 
        };
      }

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: newQuantity })
          .eq("id", existingItem.id);

        if (error) return { success: false, error: error.message };
      } else {
        // Check total cart items before inserting
        const { count: cartCount } = await supabase
          .from("cart_items")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        
        if ((cartCount || 0) >= MAX_CART_ITEMS) {
          return { 
            success: false, 
            error: `Cart is full. Maximum ${MAX_CART_ITEMS} different items allowed.` 
          };
        }
        
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
        quantity: z.number().int().positive().max(10, 'Maximum 10 items per variant'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, user } = ctx;

      // Get current cart item to find variant
      const { data: cartItem } = await supabase
        .from("cart_items")
        .select("variant_id")
        .eq("id", input.cartItemId)
        .eq("user_id", user.id)
        .single();

      if (!cartItem) {
        return { success: false, error: "Cart item not found" };
      }

      // Validate against stock
      const { data: variant } = await supabase
        .from("product_variants")
        .select("stock_quantity")
        .eq("id", cartItem.variant_id)
        .single();

      if (variant && input.quantity > variant.stock_quantity) {
        return { 
          success: false, 
          error: `Only ${variant.stock_quantity} items available in stock` 
        };
      }

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

