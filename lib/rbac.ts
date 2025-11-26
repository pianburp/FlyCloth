import { createClient } from "@/lib/supabase/server";

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

/**
 * Get the current user's role from the database
 */
export async function getUserRole(): Promise<UserRole | null> {
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
}

/**
 * Get the current user's profile
 */
export async function getUserProfile(): Promise<UserProfile | null> {
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
}

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
