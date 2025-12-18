"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator
} from "@/components/ui/sidebar";
import {
    Shirt,
    ShoppingCart,
    Package,
    Settings,
    LayoutDashboard,
    FileText,
    Home,
    User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useMemo } from "react";

// Navigation items for guests (not logged in)
const guestNavItems = [
    { title: "Home", href: "/", icon: Home },
    { title: "Browse Shirts", href: "/user", icon: Shirt },
];

// Navigation items for logged-in users
const userNavItems = [
    { title: "Home", href: "/", icon: Home },
    { title: "Browse Shirts", href: "/user", icon: Shirt },
    { title: "Cart", href: "/user/cart", icon: ShoppingCart },
    { title: "My Orders", href: "/user/orders", icon: Package },
    { title: "Settings", href: "/user/settings", icon: Settings },
];

// Navigation items for admin users
const adminNavItems = [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { title: "Products", href: "/admin/products", icon: Shirt },
    { title: "Orders", href: "/admin/orders", icon: FileText },
    { title: "Settings", href: "/admin/settings", icon: Settings },
];

// Props interface for server-side initial data
interface AppSidebarProps {
    initialUser?: {
        email: string;
        role: string;
    } | null;
}

/**
 * Sidebar component optimized with server-side initial data.
 * Receives user data from layout to avoid client-side fetch waterfall.
 * Still listens for auth changes to handle login/logout without refresh.
 */
export function AppSidebar({ initialUser }: AppSidebarProps) {
    // Initialize from server-side data instead of null/loading state
    const [user, setUser] = useState<{ email: string } | null>(
        initialUser ? { email: initialUser.email } : null
    );
    const [userRole, setUserRole] = useState<string>(initialUser?.role || "user");
    // No loading state needed when we have initial data
    const [isLoading, setIsLoading] = useState(!initialUser);
    const pathname = usePathname();
    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        // Only fetch if no initial data was provided
        if (!initialUser) {
            const getUser = async () => {
                const {
                    data: { user },
                } = await supabase.auth.getUser();
                setUser(user ? { email: user.email || '' } : null);

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
        }

        // Always listen for auth state changes (login/logout)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ? { email: session.user.email || '' } : null);
            if (session?.user) {
                supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", session.user.id)
                    .single()
                    .then(({ data }) => setUserRole(data?.role || "user"));
            } else {
                setUserRole("user");
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase, initialUser]);

    const isAdmin = userRole === "admin";

    return (
        <Sidebar collapsible="icon">
            <SidebarContent>
                {/* Main Navigation */}
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {(user ? userNavItems : guestNavItems).map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.href}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Admin Navigation */}
                {isAdmin && (
                    <>
                        <SidebarSeparator />
                        <SidebarGroup>
                            <SidebarGroupLabel>Admin</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {adminNavItems.map((item) => (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={pathname === item.href}
                                                tooltip={item.title}
                                            >
                                                <Link href={item.href}>
                                                    <item.icon className="h-4 w-4" />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </>
                )}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip={
                                isLoading
                                    ? "Loading..."
                                    : user
                                        ? user.email
                                        : "Not signed in"
                            }
                        >
                            <User className="h-4 w-4" />
                            <span className="truncate">
                                {isLoading
                                    ? "Loading..."
                                    : user
                                        ? user.email
                                        : "Not signed in"}
                            </span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
