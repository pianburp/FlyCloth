"use client";

import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

export interface AuthUser {
    id: string;
    email: string;
    role: "user" | "admin";
    display_name?: string;
    full_name?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    isAdmin: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
    initialUser?: AuthUser | null;
}

/**
 * AuthProvider - Unified auth context for client components.
 * Receives initialUser from server to avoid client-side fetch waterfall.
 * Listens for auth changes to handle login/logout without refresh.
 */
export function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(initialUser);
    const [isLoading, setIsLoading] = useState(!initialUser);
    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        // Only fetch if no initial data was provided (fallback)
        if (!initialUser) {
            const getUser = async () => {
                const { data: { user: supabaseUser } } = await supabase.auth.getUser();

                if (supabaseUser) {
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("role, full_name")
                        .eq("id", supabaseUser.id)
                        .single();

                    setUser({
                        id: supabaseUser.id,
                        email: supabaseUser.email || "",
                        role: profile?.role || "user",
                        display_name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
                        full_name: profile?.full_name,
                    });
                } else {
                    setUser(null);
                }
                setIsLoading(false);
            };
            getUser();
        }

        // Listen for auth state changes (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role, full_name")
                    .eq("id", session.user.id)
                    .single();

                setUser({
                    id: session.user.id,
                    email: session.user.email || "",
                    role: profile?.role || "user",
                    display_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
                    full_name: profile?.full_name,
                });
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase, initialUser]);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const isAdmin = user?.role === "admin";

    return (
        <AuthContext.Provider value={{ user, isLoading, isAdmin, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * useAuth hook - Access auth state from any client component.
 * Must be used within an AuthProvider.
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
