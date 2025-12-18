"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Check, Circle } from "lucide-react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const router = useRouter();

  // Password requirements
  const minLength = password.length >= 8;
  const hasCapital = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const passwordsMatch = password === repeatPassword && repeatPassword.length > 0;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    // Validation: all fields required
    if (!displayName || !email || !password || !repeatPassword) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    // Password validation: min 8 chars, 1 capital, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters, include 1 capital letter, 1 lowercase letter and 1 number");
      setIsLoading(false);
      return;
    }

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/user`,
          data: {
            role: "user", // Default role for new signups
            display_name: displayName,
          },
        },
      });
      if (error) throw error;

      // Update the auto-created profile with the full_name
      if (data.user) {
        await supabase.from("profiles").update({
          full_name: displayName,
        }).eq("id", data.user.id);
      }

      router.push("/auth/sign-up-success");
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
            Join Us
          </span>
          <h1 className="text-3xl font-light tracking-tight mb-2 fade-in-up fade-in-up-delayed-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
            Create Account
          </h1>
          <p className="text-sm text-muted-foreground font-light fade-in-up fade-in-up-delayed-2">
            Begin your journey with exclusive luxury
          </p>
        </div>

        {/* Gold Divider */}
        <div className="gold-divider mb-8 fade-in-up fade-in-up-delayed-2" />

        {/* Form */}
        <form onSubmit={handleSignUp} className="space-y-5">
          {/* Display Name Field */}
          <div className="space-y-2 fade-in-up fade-in-up-delayed-3">
            <label
              htmlFor="display-name"
              className="text-xs tracking-luxury uppercase text-muted-foreground block"
            >
              Full Name
            </label>
            <Input
              id="display-name"
              type="text"
              placeholder="Your name"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="luxury-input h-12 bg-transparent border-border/50 focus:border-[hsl(38,50%,55%,0.5)] transition-all duration-300"
            />
          </div>

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
            <label
              htmlFor="password"
              className="text-xs tracking-luxury uppercase text-muted-foreground block"
            >
              Password
            </label>
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
            {/* Password Requirements */}
            <ul className="mt-3 space-y-1.5">
              <li className={cn(
                "flex items-center gap-2 text-xs transition-colors duration-300",
                minLength ? "text-[hsl(38,50%,55%)]" : "text-muted-foreground"
              )}>
                {minLength ? <Check size={14} /> : <Circle size={14} />}
                At least 8 characters
              </li>
              <li className={cn(
                "flex items-center gap-2 text-xs transition-colors duration-300",
                hasCapital ? "text-[hsl(38,50%,55%)]" : "text-muted-foreground"
              )}>
                {hasCapital ? <Check size={14} /> : <Circle size={14} />}
                At least 1 uppercase letter
              </li>
              <li className={cn(
                "flex items-center gap-2 text-xs transition-colors duration-300",
                hasLowercase ? "text-[hsl(38,50%,55%)]" : "text-muted-foreground"
              )}>
                {hasLowercase ? <Check size={14} /> : <Circle size={14} />}
                At least 1 lowercase letter
              </li>
              <li className={cn(
                "flex items-center gap-2 text-xs transition-colors duration-300",
                hasNumber ? "text-[hsl(38,50%,55%)]" : "text-muted-foreground"
              )}>
                {hasNumber ? <Check size={14} /> : <Circle size={14} />}
                At least 1 number
              </li>
            </ul>
          </div>

          {/* Repeat Password Field */}
          <div className="space-y-2 fade-in-up fade-in-up-delayed-3">
            <label
              htmlFor="repeat-password"
              className="text-xs tracking-luxury uppercase text-muted-foreground block"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Input
                id="repeat-password"
                type={showRepeatPassword ? "text" : "password"}
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="luxury-input h-12 bg-transparent border-border/50 focus:border-[hsl(38,50%,55%,0.5)] transition-all duration-300 pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowRepeatPassword((v) => !v)}
                aria-label={showRepeatPassword ? "Hide password" : "Show password"}
              >
                {showRepeatPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Dynamic password match indicator */}
            {repeatPassword.length > 0 && (
              <div className={cn(
                "flex items-center gap-2 text-xs mt-2 transition-colors duration-300",
                passwordsMatch ? "text-[hsl(38,50%,55%)]" : "text-red-500"
              )}>
                {passwordsMatch ? <Check size={14} /> : <Circle size={14} />}
                {passwordsMatch ? "Passwords match" : "Passwords do not match"}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="fade-in-up fade-in-up-delayed-4 pt-2">
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
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center fade-in-up fade-in-up-delayed-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-foreground hover:text-[hsl(38,50%,55%)] transition-colors luxury-underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
