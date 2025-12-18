"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    // Validation: all fields required
    if (!email || !password) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Get user role and redirect accordingly
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user?.id)
        .single();

      const userRole = profile?.role || "user";
      const redirectUrl = userRole === "admin" ? "/admin" : "/user";
      router.push(redirectUrl);
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      {/* Luxury Card */}
      <div className="luxury-card p-8 md:p-10 fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs tracking-luxury uppercase text-muted-foreground mb-3 block fade-in-up fade-in-up-delayed-1">
            Welcome Back
          </span>
          <h1 className="text-3xl font-light tracking-tight mb-2 fade-in-up fade-in-up-delayed-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
            Sign In
          </h1>
          <p className="text-sm text-muted-foreground font-light fade-in-up fade-in-up-delayed-2">
            Enter your credentials to access your account
          </p>
        </div>

        {/* Gold Divider */}
        <div className="gold-divider mb-8 fade-in-up fade-in-up-delayed-2" />

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2 fade-in-up fade-in-up-delayed-3">
            <label
              htmlFor="email"
              className="text-xs tracking-luxury uppercase text-muted-foreground block"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="luxury-input h-12 bg-transparent border-border/50 focus:border-[hsl(38,50%,55%,0.5)] transition-all duration-300"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2 fade-in-up fade-in-up-delayed-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-xs tracking-luxury uppercase text-muted-foreground block"
              >
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors luxury-underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="luxury-input h-12 bg-transparent border-border/50 focus:border-[hsl(38,50%,55%,0.5)] transition-all duration-300 pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="fade-in-up fade-in-up-delayed-4">
            <Button
              type="submit"
              className="w-full h-12 luxury-button-gold text-white font-light tracking-wide uppercase text-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center fade-in-up fade-in-up-delayed-4">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/sign-up"
              className="text-foreground hover:text-[hsl(38,50%,55%)] transition-colors luxury-underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
