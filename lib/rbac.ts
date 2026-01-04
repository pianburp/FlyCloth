import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { cache } from "react";

export type UserRole = "user" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  full_name?: string;
  phone?: string;
  address?: string;
  role: UserRole;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  display_name?: string;
  full_name?: string;
}

/**
 * Get auth user from middleware headers (single source of truth)
 * Falls back to null if no header present
 * 
 * This is the PRIMARY method for getting auth data in server components.
 * The middleware (proxy.ts) already fetches user and profile on every request,
 * so we reuse that data to avoid redundant database calls.
 * 
 * SECURITY: We validate that the header's user ID matches the actual session
 * to prevent header spoofing attacks.
 */
export async function getAuthFromHeaders(): Promise<AuthUser | null> {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("x-auth-user");
    
    if (authHeader) {
      const authData = JSON.parse(authHeader);
      
      // SECURITY: Validate header against actual Supabase session
      // This prevents spoofing if someone bypasses middleware
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      // If header claims a user but session doesn't match, reject it
      if (!user || user.id !== authData.id) {
        console.warn('[RBAC] Auth header mismatch - possible spoofing attempt');
        return null;
      }
      
      return {
        id: authData.id,
        email: authData.email,
        role: authData.role || "user",
        display_name: authData.display_name,
        full_name: authData.full_name,
      };
    }
  } catch {
    // Header parsing failed, fall back to null
  }
  return null;
}

/**
 * Request-scoped cached version of getAuthFromHeaders
 * Prevents multiple header parsing calls within the same request
 */
export const getCachedAuthFromHeaders = cache(getAuthFromHeaders);

/**
 * Get the current user's role
 * 
 * OPTIMIZED: Prefers middleware header data, falls back to DB only if needed.
 */
export const getUserRole = cache(async (): Promise<UserRole | null> => {
  // Try headers first (already fetched by middleware)
  const authData = await getAuthFromHeaders();
  if (authData) return authData.role;
  
  // Fallback to DB for edge cases (e.g., API routes without middleware)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role || "user";
});

/**
 * Get the current user's profile
 * 
 * OPTIMIZED: Uses cached auth from headers for basic info,
 * only fetches from DB when full profile is needed.
 */
export const getUserProfile = cache(async (): Promise<UserProfile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    email: user.email || "",
    display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
    full_name: profile.full_name,
    phone: profile.phone,
    address: profile.address,
    role: profile.role || "user",
    created_at: profile.created_at,
  };
});

/**
 * Legacy alias for getUserProfile (deprecated, use getUserProfile directly)
 * @deprecated Use getUserProfile instead
 */
export const getCachedUserProfile = getUserProfile;

/**
 * Check if the current user has a specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const userRole = await getUserRole();
  return userRole === role;
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole("admin");
}

/**
 * Check if the current user is a regular user
 */
export async function isUser(): Promise<boolean> {
  return hasRole("user");
}

/**
 * Require a specific role - throws error if user doesn't have the role
 */
export async function requireRole(role: UserRole): Promise<void> {
  const userRole = await getUserRole();
  
  if (!userRole) {
    throw new Error("User not authenticated");
  }
  
  if (userRole !== role) {
    throw new Error(`Access denied. Required role: ${role}`);
  }
}

/**
 * Require admin role - throws error if user is not an admin
 */
export async function requireAdmin(): Promise<void> {
  await requireRole("admin");
}
