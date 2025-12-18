import { AuthButton } from "@/components/auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeSwitcher } from "@/components/layout";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import Link from "next/link";
import { Suspense } from "react";
import { Hero, Features, ContactUs } from "@/components/marketing";
import { RootLayoutWrapper } from "@/components/layout/root-layout-wrapper";
import { getCachedUserProfile } from "@/lib/rbac";
import { AuthProvider, AuthUser } from "@/lib/auth-context";

export default async function Home() {
  const profile = await getCachedUserProfile();

  if (profile) {
    return (
      <RootLayoutWrapper>
        <Hero />
        <div className="flex flex-col">
          <Features />
          <ContactUs />
        </div>
      </RootLayoutWrapper>
    );
  }

  // Guest view - wrap with AuthProvider (null user)
  return (
    <AuthProvider initialUser={null}>
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <SidebarInset>
          {/* Announcement Bar */}
          <div className="bg-black text-white py-2 text-center">
            <p className="text-xs tracking-luxury uppercase">
              Complimentary Shipping on Orders Over RM 500
            </p>
          </div>

          {/* Header - Consistent with authenticated layout */}
          <header className="w-full flex justify-between items-center border-b border-b-foreground/10 h-14 sm:h-16 px-2 sm:px-4 sticky top-0 bg-background/95 backdrop-blur-md z-50">
            <div className="flex items-center gap-2 sm:gap-4">
              <SidebarTrigger className="-ml-1" />
              {/* Desktop logo */}
              <Link href="/" className="text-xl font-light tracking-tight hidden sm:block">
                FlyCloth
              </Link>
              {/* Mobile logo */}
              <Link href="/" className="text-base font-light tracking-tight sm:hidden">
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

          {/* Main Content */}
          <main className="flex-1 w-full bg-background">
            {/* Hero Section */}
            <Hero />

            {/* Features/Collections Section */}
            <Features />

            {/* Editorial/Newsletter/Contact Section */}
            <ContactUs />
          </main>

          {/* Footer */}
          <footer className="w-full flex items-center justify-center border-t text-center text-xs py-8">
            <p>FlyCloth - Your Premium Destination for Luxury Attire</p>
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  );
}
