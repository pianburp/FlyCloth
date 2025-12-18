"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, LogIn, UserPlus, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function AuthButton() {
  const { user, isLoading, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent double-clicks

    setIsLoggingOut(true);
    try {
      await signOut();
      // Use full page reload to ensure fresh server-rendered auth state
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
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
          {user.display_name || user.email}
        </span>
        <Badge variant={user.role === "admin" ? "destructive" : "secondary"} className="text-xs">
          {user.role === "admin" ? "Admin" : "User"}
        </Badge>
      </div>

      {/* Mobile: Icon-only logout button */}
      <Button size="icon" variant="ghost" onClick={handleLogout} disabled={isLoggingOut} className="sm:hidden h-8 w-8">
        {isLoggingOut ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <LogOut className="w-4 h-4 text-muted-foreground" />
        )}
        <span className="sr-only">Logout</span>
      </Button>

      {/* Desktop: Full logout button with text */}
      <Button size="sm" variant="ghost" onClick={handleLogout} disabled={isLoggingOut} className="hidden sm:inline-flex">
        {isLoggingOut ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <LogOut className="w-4 h-4 mr-2 text-muted-foreground" />
        )}
        {isLoggingOut ? "Logging out..." : "Logout"}
      </Button>
    </div>
  );
}
