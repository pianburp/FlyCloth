import { AuthButton } from "@/components/auth";
import { ThemeSwitcher } from "@/components/layout";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import { Hero, Features, ContactUs } from "@/components/marketing";
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RootLayoutWrapper } from "@/components/layout/root-layout-wrapper";
import { getCachedUserProfile } from "@/lib/rbac";

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

  return (
    <main className="min-h-screen bg-background flex flex-col relative">
      {/* Luxury Navigation Bar */}
      <nav className="fixed top-0 z-50 w-full bg-transparent">
        {/* Top bar with announcement */}
        <div className="bg-black text-white py-2 text-center">
          <p className="text-xs tracking-luxury uppercase">
            Complimentary Shipping on Orders Over RM 500
          </p>
        </div>

        {/* Main navigation */}
        <div className="bg-background/80 backdrop-blur-md border-b border-border/30">
          <div className="container mx-auto flex h-16 items-center justify-between px-6 lg:px-12">
            {/* Left Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <Link
                href="/shop"
                className="text-xs tracking-luxury uppercase text-foreground/80 hover:text-foreground transition-colors duration-300 luxury-underline"
              >
                Collections
              </Link>
              <Link
                href="/custom-tailored"
                className="text-xs tracking-luxury uppercase text-foreground/80 hover:text-foreground transition-colors duration-300 luxury-underline"
              >
                Custom Tailored
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="w-5 h-5" />
            </Button>

            {/* Logo */}
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 transition-opacity hover:opacity-80"
            >
              <span className="text-xl lg:text-2xl font-light tracking-tight">
                FlyCloth
              </span>
            </Link>

            {/* Right Navigation */}
            <div className="flex items-center gap-4 lg:gap-6">
                <Suspense fallback={<Button variant="ghost" size="icon"><User className="w-4 h-4" /></Button>}>
                  <AuthButton />
                </Suspense>
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <Hero />

      {/* Main Content */}
      <div className="flex flex-col">
        {/* Features/Collections Section */}
        <Features />

        {/* Editorial/Newsletter/Contact Section */}
        <ContactUs />
      </div>
    </main>
  );
}
