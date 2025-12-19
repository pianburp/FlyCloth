/**
 * User and authentication type definitions
 * Consolidated from lib/rbac.ts and lib/auth-context.tsx
 */

/** User role enum */
export type UserRole = "user" | "admin";

/** Auth user for client-side context */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  display_name?: string;
  full_name?: string;
}

/** Full user profile with all database fields */
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

/** Profile summary for display purposes */
export interface ProfileSummary {
  full_name: string | null;
}
