"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, LogIn, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

export function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("user");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setUserRole(profile?.role || "user");
      }
      setIsLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => setUserRole(data?.role || "user"));
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (isLoading) {
    return (
      <Button size="sm" variant="ghost" disabled>
        <LogIn className="w-4 h-4" />
      </Button>
    );
  }

  // Not logged in - show Sign In and Register buttons
  if (!user) {
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Mobile: Icon-only sign in button */}
        <Button size="icon" variant="ghost" asChild className="sm:hidden h-8 w-8">
          <Link href="/auth/login">
            <LogIn className="w-4 h-4" />
            <span className="sr-only">Sign In</span>
          </Link>
        </Button>

        {/* Desktop: Full buttons with text */}
        <Button size="sm" variant="ghost" asChild className="hidden sm:inline-flex">
          <Link href="/auth/login">
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Link>
        </Button>
        <Button size="sm" variant="default" asChild className="hidden sm:inline-flex">
          <Link href="/auth/sign-up">
            <UserPlus className="w-4 h-4 mr-2" />
            Register
          </Link>
        </Button>
      </div>
    );
  }

  // Logged in - show user info and logout button
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {/* Desktop: Show full user info */}
      <div className="hidden sm:flex items-center gap-2">
        <span className="text-sm text-muted-foreground truncate max-w-[150px]">
          {user.user_metadata?.display_name || user.email}
        </span>
        <Badge variant={userRole === "admin" ? "destructive" : "secondary"} className="text-xs">
          {userRole === "admin" ? "Admin" : "User"}
        </Badge>
      </div>

      {/* Mobile: Icon-only logout button */}
      <Button size="icon" variant="ghost" onClick={handleLogout} className="sm:hidden h-8 w-8">
        <LogOut className="w-4 h-4 text-muted-foreground" />
        <span className="sr-only">Logout</span>
      </Button>

      {/* Desktop: Full logout button with text */}
      <Button size="sm" variant="ghost" onClick={handleLogout} className="hidden sm:inline-flex">
        <LogOut className="w-4 h-4 mr-2 text-muted-foreground" />
        Logout
      </Button>
    </div>
  );
}
