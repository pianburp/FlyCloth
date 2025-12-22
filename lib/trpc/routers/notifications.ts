import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";

export const notificationsRouter = router({
  /**
   * List notifications for the current user
   * Admins also see admin-targeted notifications (user_id IS NULL)
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        unreadOnly: z.boolean().default(false),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx;
      const limit = input?.limit ?? 20;
      const unreadOnly = input?.unreadOnly ?? false;

      // Build query - RLS will filter automatically
      let query = supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (unreadOnly) {
        query = query.eq("is_read", false);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data ?? [];
    }),

  /**
   * Get unread count
   */
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const { supabase } = ctx;

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false);

    if (error) {
      throw new Error(error.message);
    }

    return count ?? 0;
  }),

  /**
   * Mark a single notification as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx;

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", input.notificationId);

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const { supabase, user, role } = ctx;
    
    // Mark user's own notifications
    const { error: userError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (userError) {
      throw new Error(userError.message);
    }

    // If admin, also mark admin notifications
    if (role === "admin") {
      const { error: adminError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .is("user_id", null)
        .eq("is_read", false);

      if (adminError) {
        throw new Error(adminError.message);
      }
    }

    return { success: true };
  }),
});
