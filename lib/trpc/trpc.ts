import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { getUserRole, type UserRole } from "@/lib/rbac";

/**
 * tRPC Context - Available in all procedures
 */
export interface TRPCContext {
  user: User | null;
  role: UserRole | null;
}

/**
 * Create context for each request
 */
export async function createTRPCContext(): Promise<TRPCContext> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let role: UserRole | null = null;
  if (user) {
    role = await getUserRole();
  }
  
  return {
    user,
    role,
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
    },
  });
});
