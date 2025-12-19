import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { revalidatePath } from "next/cache";

export const userRouter = router({
  /**
   * Update user profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        fullName: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, user } = ctx;

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: input.fullName,
          phone: input.phone,
          address: input.address,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      revalidatePath("/user/settings");
      return { success: true, message: "Profile updated successfully" };
    }),
});
