import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { ContactUs } from "@/components/contact-us";
import { Menu, Search, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
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
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Search className="w-4 h-4" />
              </Button>

              {!hasEnvVars ? (
                <EnvVarWarning />
              ) : (
                <Suspense fallback={<Button variant="ghost" size="icon"><User className="w-4 h-4" /></Button>}>
                  <AuthButton />
                </Suspense>
              )}

              <Link href="/user/cart" className="relative">
                <ShoppingBag className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-foreground text-background rounded-full text-[10px] flex items-center justify-center font-medium">
                  0
                </span>
              </Link>

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

      {/* Luxury Footer */}
      <footer className="w-full border-t border-border/30 bg-background">
        {/* Main Footer Content */}
        <div className="container mx-auto px-6 lg:px-12 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Link href="/" className="inline-block mb-6">
                <span className="text-2xl font-light tracking-tight">FlyCloth</span>
              </Link>
              <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-xs">
                A house of unparalleled craftsmanship, where tradition meets contemporary elegance
                to create timeless masterpieces.
              </p>
            </div>

            {/* Shop */}
            <div>
              <h4 className="text-xs tracking-luxury uppercase text-muted-foreground mb-6">Shop</h4>
              <ul className="space-y-3">
                {["New Arrivals", "Ready-to-Wear", "Haute Couture", "Accessories", "Limited Edition"].map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-sm font-light text-foreground/70 hover:text-foreground transition-colors duration-300"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-xs tracking-luxury uppercase text-muted-foreground mb-6">Services</h4>
              <ul className="space-y-3">
                {["Private Appointments", "Made to Measure", "Gift Services", "Alterations", "Care & Repairs"].map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-sm font-light text-foreground/70 hover:text-foreground transition-colors duration-300"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* About */}
            <div>
              <h4 className="text-xs tracking-luxury uppercase text-muted-foreground mb-6">About</h4>
              <ul className="space-y-3">
                {["Our Story", "Craftsmanship", "Sustainability", "Careers", "Contact"].map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-sm font-light text-foreground/70 hover:text-foreground transition-colors duration-300"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border/30">
          <div className="container mx-auto px-6 lg:px-12 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground/60">
                © 2025 FlyCloth. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <Link
                  href="/privacy"
                  className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors duration-300"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors duration-300"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/cookies"
                  className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors duration-300"
                >
                  Cookie Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
