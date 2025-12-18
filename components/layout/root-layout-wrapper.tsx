import { getCachedUserProfile } from "@/lib/rbac";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeSwitcher } from "@/components/layout";
import { AuthButton } from "@/components/auth";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AuthProvider, AuthUser } from "@/lib/auth-context";
import Link from "next/link";
import { Suspense } from "react";

interface RootLayoutWrapperProps {
    children: React.ReactNode;
}

/**
 * Smart layout wrapper for root pages.
 * - Authenticated users: Shows sidebar navigation with AuthProvider
 * - Guests: Renders children directly wrapped in main (landing page has its own nav)
 */
export async function RootLayoutWrapper({ children }: RootLayoutWrapperProps) {
    const profile = await getCachedUserProfile();

    // If not authenticated, render children directly (landing page has its own nav)
    if (!profile) {
        return <main className="min-h-screen bg-background flex flex-col relative">{children}</main>;
    }

    // Authenticated users get the sidebar layout with AuthProvider
    const initialUser: AuthUser = {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        display_name: profile.display_name,
        full_name: profile.full_name,
    };

    return (
        <AuthProvider initialUser={initialUser}>
            <SidebarProvider defaultOpen={false}>
                <AppSidebar />
                <SidebarInset>
                    <header className="w-full flex justify-between items-center border-b border-b-foreground/10 h-14 sm:h-16 px-2 sm:px-4 sticky top-0 bg-background z-50">
                        <div className="flex items-center gap-2 sm:gap-4">
                            <SidebarTrigger className="-ml-1" />
                            {/* Desktop logo */}
                            <Link href={"/"} className="text-xl font-semibold hidden sm:block">
                                FlyCloth
                            </Link>
                            {/* Mobile logo */}
                            <Link href={"/"} className="text-base font-semibold sm:hidden">
                                FlyCloth
                            </Link>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
                            <Suspense>
                                <AuthButton />
                            </Suspense>
                            <ThemeSwitcher />
                        </div>
                    </header>
                    <main className="flex-1 w-full bg-background">
                        {children}
                    </main>
                    <footer className="w-full flex items-center justify-center border-t text-center text-xs py-8">
                        <p>FlyCloth - Your Premium Destination</p>
                    </footer>
                </SidebarInset>
            </SidebarProvider>
        </AuthProvider>
    );
}
