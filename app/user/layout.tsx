import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Suspense } from "react";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/user"} className="text-xl">BajuNow</Link>
              {/* Navigation links moved into `AuthButton` for unified, mobile-friendly UI */}
            </div>
            <div className="flex items-center gap-4">
              <Suspense>
                <AuthButton />
              </Suspense>
              <ThemeSwitcher />
            </div>
          </div>
        </nav>
        <div className="flex-1 w-full max-w-7xl p-5">
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            BajuNow - Your Premium Shirt Destination
          </p>
        </footer>
      </div>
    </main>
  );
}
