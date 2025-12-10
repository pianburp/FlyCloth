import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { ContactUs } from "@/components/contact-us";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
        <div className="absolute right-0 bottom-0 -z-10 h-[310px] w-[310px] rounded-full bg-secondary/20 opacity-20 blur-[100px]"></div>
      </div>

      {/* Minimalist Navigation Bar */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-background/50 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
             <span className="text-xl font-bold tracking-tight text-white">FlyCloth</span>
          </Link>
          <div className="flex items-center gap-4">
            {!hasEnvVars ? <EnvVarWarning /> : <Suspense><AuthButton /></Suspense>}
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <Hero />

      <div className="flex flex-col gap-16 pb-16 pt-16">
        {/* Features Section */}
        <section className="container mx-auto px-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <Features />
        </section>

        {/* Contact Us Section */}
        <section className="container mx-auto px-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <ContactUs />
        </section>
      </div>

      {/* Minimalist Footer */}
      <footer className="w-full border-t bg-background/50 backdrop-blur-sm py-8 mt-auto">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between px-4 gap-4">
          <p className="text-sm text-muted-foreground">© 2025 FlyCloth — All rights reserved</p>
          <div className="flex items-center gap-6">
            <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" href="#">Instagram</a>
            <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" href="#">Twitter</a>
            <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" href="#">Facebook</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
