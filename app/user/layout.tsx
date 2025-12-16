import { AuthButton } from "@/components/auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeSwitcher } from "@/components/layout";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import Link from "next/link";
import { Suspense } from "react";
import { getCachedUserProfile } from "@/lib/rbac";

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
        <header className="w-full flex justify-between items-center border-b border-b-foreground/10 h-16 px-4 sticky top-0 bg-background z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <Link href={"/user"} className="text-xl font-semibold hidden sm:block">
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
        <div className="flex-1 w-full max-w-7xl mx-auto p-5">
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </div>
        <footer className="w-full flex items-center justify-center border-t text-center text-xs py-8">
          <p>FlyCloth - Your Premium Shirt Destination</p>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
