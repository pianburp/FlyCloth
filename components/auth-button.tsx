"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Menu, LogOut, ShoppingCart, Package, LayoutDashboard, Shirt, Settings, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("user");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

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
      <Button size="sm" variant="outline" disabled>
        <Menu className="w-4 h-4" />
      </Button>
    );
  }

  if (!user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline">
            <Menu className="w-4 h-4 mr-2" />
            Menu
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild className="animate-in fade-in slide-in-from-top-1 duration-300" style={{ animationDelay: '0ms', animationFillMode: 'backwards' }}>
            <Link href="/user" className="cursor-pointer">
              <Shirt className="w-4 h-4 mr-2" />
              Browse Shirts
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="animate-in fade-in slide-in-from-top-1 duration-300" style={{ animationDelay: '50ms', animationFillMode: 'backwards' }}>
            <Link href="/auth/login" className="cursor-pointer">
              Sign in
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="animate-in fade-in slide-in-from-top-1 duration-300" style={{ animationDelay: '100ms', animationFillMode: 'backwards' }}>
            <Link href="/auth/sign-up" className="cursor-pointer font-semibold">
              Shop Now
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          <Menu className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">{user.user_metadata?.display_name || user.email}</span>
          <Badge variant={userRole === "admin" ? "destructive" : "secondary"} className="text-xs ml-2">
            {userRole === "admin" ? "Admin" : "User"}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="animate-in fade-in slide-in-from-top-1 duration-300" style={{ animationDelay: '0ms', animationFillMode: 'backwards' }}>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{user.user_metadata?.display_name || user.email}</span>
            <span className="text-xs text-muted-foreground">{userRole === "admin" ? "Administrator" : "Customer"}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="animate-in fade-in slide-in-from-top-1 duration-300" style={{ animationDelay: '50ms', animationFillMode: 'backwards' }}>
          <Link href="/user" className="cursor-pointer">
            <Shirt className="w-4 h-4 mr-2" />
            Browse Shirts
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="animate-in fade-in slide-in-from-top-1 duration-300" style={{ animationDelay: '100ms', animationFillMode: 'backwards' }}>
          <Link href="/user/cart" className="cursor-pointer">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Cart
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="animate-in fade-in slide-in-from-top-1 duration-300" style={{ animationDelay: '150ms', animationFillMode: 'backwards' }}>
          <Link href="/user/orders" className="cursor-pointer">
            <Package className="w-4 h-4 mr-2" />
            My Orders
          </Link>
        </DropdownMenuItem>
        {userRole === "admin" && (
          <>
            <DropdownMenuItem asChild className="animate-in fade-in slide-in-from-top-1 duration-300" style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
              <Link href="/admin" className="cursor-pointer">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Admin Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="animate-in fade-in slide-in-from-top-1 duration-300" style={{ animationDelay: '250ms', animationFillMode: 'backwards' }}>
              <Link href="/admin/products" className="cursor-pointer">
                <Shirt className="w-4 h-4 mr-2" />
                Products
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="animate-in fade-in slide-in-from-top-1 duration-300" style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}>
              <Link href="/admin/orders" className="cursor-pointer">
                <FileText className="w-4 h-4 mr-2" />
                Orders
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="animate-in fade-in slide-in-from-top-1 duration-300" style={{ animationDelay: '350ms', animationFillMode: 'backwards' }}>
              <Link href="/admin/settings" className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 animate-in fade-in slide-in-from-top-1 duration-300" style={{ animationDelay: userRole === "admin" ? '400ms' : '200ms', animationFillMode: 'backwards' }}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
