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
    Users,
    Star,
    Boxes,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

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

// Navigation items for admin users (admin section)
const adminNavItems = [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { title: "Products", href: "/admin/products", icon: Shirt },
    { title: "Inventory", href: "/admin/inventory", icon: Boxes },
    { title: "Orders", href: "/admin/orders", icon: FileText },
    { title: "Customers", href: "/admin/customers", icon: Users },
    { title: "Reviews", href: "/admin/reviews", icon: Star },
    { title: "Settings", href: "/admin/settings", icon: Settings },
];

/**
 * Sidebar component using unified auth context.
 * Shows navigation based on user role.
 * Admin users see both user navigation AND admin section.
 */
export function AppSidebar() {
    const { user, isAdmin, isLoading } = useAuth();
    const pathname = usePathname();

    return (
        <Sidebar collapsible="icon" className="border-r-0">
            {/* Luxury Sidebar Header */}
            <div className="relative px-4 py-5 border-b border-sidebar-border">
                <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                    <span className="text-lg font-light tracking-tight group-data-[collapsible=icon]:hidden">
                        FlyCloth
                    </span>
                    <span className="text-lg font-light tracking-tight hidden group-data-[collapsible=icon]:block">
                        FC
                    </span>
                </Link>
                {/* Gold accent line */}
                <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[hsl(38,50%,55%,0.4)] to-transparent group-data-[collapsible=icon]:left-2 group-data-[collapsible=icon]:right-2" />
            </div>

            <SidebarContent>
                {/* Navigation based on role */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] tracking-luxury uppercase text-sidebar-foreground/60 font-medium">
                        {isAdmin ? "Admin" : "Navigation"}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {/* Admin users see admin items only */}
                            {/* Regular users see user items */}
                            {/* Guests see guest items */}
                            {(isAdmin ? adminNavItems : user ? userNavItems : guestNavItems).map((item) => (
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
            </SidebarContent>

            {/* Luxury Footer */}
            <SidebarFooter className="border-t border-sidebar-border relative">
                {/* Gold accent line */}
                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[hsl(38,50%,55%,0.3)] to-transparent" />
                <SidebarMenu className="py-3">
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip={
                                isLoading
                                    ? "Loading..."
                                    : user
                                        ? user.email
                                        : "Not signed in"
                            }
                            className="transition-all duration-300 hover:bg-sidebar-accent rounded-none px-3 py-2.5"
                        >
                            <div className="w-7 h-7 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
                                <User className="h-3.5 w-3.5 text-sidebar-foreground/70" />
                            </div>
                            <span className="text-sm font-light truncate">
                                {isLoading
                                    ? "Loading..."
                                    : user
                                        ? user.email
                                        : "Guest"}
                            </span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
