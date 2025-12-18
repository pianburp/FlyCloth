import { AuthButton } from "@/components/auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeSwitcher } from "@/components/layout";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import Link from "next/link";
import { Suspense } from "react";
import { getCachedUserProfile } from "@/lib/rbac";
import { PageSkeleton } from "@/components/shared/page-skeleton";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user data on server to pass to sidebar for instant render
  const profile = await getCachedUserProfile();

  const initialUser = profile ? {
    email: profile.email,
    role: profile.role,
  } : null;

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar initialUser={initialUser} />
      <SidebarInset>
        {/* Luxury Header */}
        <header className="w-full flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8 sticky top-0 bg-background/95 backdrop-blur-md z-10 border-b border-border/40">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <Link
              href="/user"
              className="hidden sm:flex flex-col items-start transition-opacity hover:opacity-80"
            >
              <span className="text-lg font-light tracking-tight">FlyCloth</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Suspense>
              <AuthButton />
            </Suspense>
            <ThemeSwitcher />
          </div>
          {/* Gold accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(38,50%,55%,0.3)] to-transparent" />
        </header>

        {/* Main Content */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<PageSkeleton />}>
            {children}
          </Suspense>
        </div>

        {/* Luxury Footer */}
        <footer className="w-full border-t border-border/40 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(38,50%,55%,0.2)] to-transparent" />
          <div className="flex flex-col items-center justify-center text-center py-10 space-y-2">
            <p className="text-xs tracking-luxury uppercase text-muted-foreground">FlyCloth</p>
            <p className="text-[10px] text-muted-foreground/60 font-light">Your Premium Destination for Luxury Attire</p>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}

