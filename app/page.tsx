import { AuthButton } from "@/components/auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeSwitcher } from "@/components/layout";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import Link from "next/link";
import { Suspense } from "react";
import { Hero, Features, ContactUs } from "@/components/marketing";
import { RootLayoutWrapper } from "@/components/layout/root-layout-wrapper";
import { getCachedUserProfile } from "@/lib/rbac";
import { AuthProvider } from "@/lib/auth-context";

import { createClient } from "@/lib/supabase/server";

// Shared content component to avoid duplication
function MainContent({ promotedProducts }: { promotedProducts: any[] }) {
  return (
    <>
      <Hero />
      <Features promotedProducts={promotedProducts} />
      <ContactUs />
    </>
  );
}

export default async function Home() {
  const profile = await getCachedUserProfile();
  const supabase = await createClient();

  // Fetch latest 3 products for the Features section
  const { data: promotedProducts } = await supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      base_price,
      product_images (
        storage_path,
        is_primary
      )
    `)
    .eq('is_active', true)
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(3);

  const products = promotedProducts || [];

  // Authenticated user view
  if (profile) {
    return (
      <RootLayoutWrapper>
        <MainContent promotedProducts={products} />
      </RootLayoutWrapper>
    );
  }

  // Guest view - wrap with AuthProvider (null user)
  return (
    <AuthProvider initialUser={null}>
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <SidebarInset>
          {/* Header */}
          <header className="w-full flex justify-between items-center border-b border-b-foreground/10 h-14 sm:h-16 px-2 sm:px-4 sticky top-0 bg-background/95 backdrop-blur-md z-50">
            <div className="flex items-center gap-2 sm:gap-4">
              <SidebarTrigger className="-ml-1" />
              <Link href="/" className="text-xl font-light tracking-tight hidden sm:block">
                FlyCloth
              </Link>
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
            <MainContent promotedProducts={products} />
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
