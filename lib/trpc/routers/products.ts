import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";

/**
 * Products Router
 * 
 * NOTE: addToCart was moved to cart router for better organization.
 * This router is now reserved for product-related mutations like
 * wishlist, reviews, etc.
 */
export const productsRouter = router({
  /**
   * Toggle product wishlist
   * (placeholder for future implementation)
   */
  // toggleWishlist: protectedProcedure
  //   .input(z.object({ productId: z.string().uuid() }))
  //   .mutation(async ({ ctx, input }) => {
  //     // TODO: Implement wishlist functionality
  //   }),
});
