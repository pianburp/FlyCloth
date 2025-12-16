import { getCachedUserProfile } from "@/lib/rbac";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeSwitcher } from "@/components/layout";
import { AuthButton } from "@/components/auth";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import Link from "next/link";
import { Suspense } from "react";

interface RootLayoutWrapperProps {
    children: React.ReactNode;
}

/**
 * Smart layout wrapper for root pages.
 * - Authenticated users: Shows sidebar navigation
 * - Guests: Renders children directly wrapped in main (landing page has its own nav)
 */
export async function RootLayoutWrapper({ children }: RootLayoutWrapperProps) {
    const profile = await getCachedUserProfile();

    // If not authenticated, render children directly (landing page has its own nav)
    if (!profile) {
        return <main className="min-h-screen bg-background flex flex-col relative">{children}</main>;
    }

    // Authenticated users get the sidebar layout
    const initialUser = {
        email: profile.email,
        role: profile.role,
    };

    return (
        <SidebarProvider defaultOpen={false}>
            <AppSidebar initialUser={initialUser} />
            <SidebarInset>
                <header className="w-full flex justify-between items-center border-b border-b-foreground/10 h-16 px-4 sticky top-0 bg-background z-50">
                    <div className="flex items-center gap-4">
                        <SidebarTrigger className="-ml-1" />
                        <Link href={"/"} className="text-xl font-semibold hidden sm:block">
                            FlyCloth
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
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
    );
}

