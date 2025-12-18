import { AuthButton } from "@/components/auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeSwitcher } from "@/components/layout";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import Link from "next/link";
import { Suspense } from "react";
import { getCachedUserProfile } from "@/lib/rbac";
import { AdminPageSkeleton } from "@/components/shared/page-skeleton";

export default async function AdminLayout({
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
        <header className="w-full flex justify-between items-center border-b border-b-foreground/10 h-14 sm:h-16 px-2 sm:px-4 sticky top-0 bg-background z-10">
          <div className="flex items-center gap-2 sm:gap-4">
            <SidebarTrigger className="-ml-1" />
            {/* Desktop logo */}
            <Link href={"/admin"} className="text-xl font-semibold items-center gap-2 hidden sm:flex">
              FlyCloth
            </Link>
            {/* Mobile logo */}
            <Link href={"/admin"} className="text-base font-semibold flex items-center sm:hidden">
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
        <div className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-5">
          <Suspense fallback={<AdminPageSkeleton />}>
            {children}
          </Suspense>
        </div>
        <footer className="w-full flex items-center justify-center border-t text-center text-xs py-8">
          <p>FlyCloth Admin Panel - Manage Your Store</p>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}

