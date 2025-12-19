import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { createClient } from "@/lib/supabase/server";
import { getAuthFromHeaders, type UserRole } from "@/lib/rbac";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * tRPC Context - Available in all procedures
 * 
 * Uses auth data from middleware headers to avoid redundant DB calls.
 * The middleware (proxy.ts) already fetches user and role, so we reuse that.
 */
export interface TRPCContext {
  user: { id: string; email: string } | null;
  role: UserRole | null;
  supabase: SupabaseClient;
}

/**
 * Create context for each request
 * 
 * OPTIMIZED: Uses middleware-injected auth headers instead of fetching from DB.
 * This eliminates 2-3 redundant database calls per request.
 */
export async function createTRPCContext(): Promise<TRPCContext> {
  const supabase = await createClient();
  
  // Get auth data from middleware header (already fetched in proxy.ts)
  const authUser = await getAuthFromHeaders();
  
  if (authUser) {
    return {
      user: { id: authUser.id, email: authUser.email },
      role: authUser.role,
      supabase,
    };
  }
  
  // Fallback: No auth header means user is not authenticated
  return {
    user: null,
    role: null,
    supabase,
  };
}

/**
 * Initialize tRPC
 */
const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: null,
      },
    };
  },
});

/**
 * Router and procedure exports
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      supabase: ctx.supabase,
    },
  });
});

/**
 * Admin procedure - requires admin role
 */
export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action",
    });
  }
  if (ctx.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You must be an admin to perform this action",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      role: ctx.role,
      supabase: ctx.supabase,
    },
  });
});
