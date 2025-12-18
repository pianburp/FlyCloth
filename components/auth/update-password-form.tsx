"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, KeyRound, Check, Circle } from "lucide-react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  // Password requirements
  const minLength = password.length >= 8;
  const hasCapital = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    // Password validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters, include 1 uppercase, 1 lowercase letter and 1 number");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push("/user");
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
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[hsl(38,50%,55%,0.1)] flex items-center justify-center fade-in-up fade-in-up-delayed-1">
            <KeyRound className="w-7 h-7 text-[hsl(38,50%,55%)]" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs tracking-luxury uppercase text-muted-foreground mb-3 block fade-in-up fade-in-up-delayed-1">
            Security Update
          </span>
          <h1 className="text-3xl font-light tracking-tight mb-2 fade-in-up fade-in-up-delayed-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
            New Password
          </h1>
          <p className="text-sm text-muted-foreground font-light fade-in-up fade-in-up-delayed-2">
            Please enter your new password below
          </p>
        </div>

        {/* Gold Divider */}
        <div className="gold-divider mb-8 fade-in-up fade-in-up-delayed-2" />

        {/* Form */}
        <form onSubmit={handleUpdatePassword} className="space-y-5">
          {/* Password Field */}
          <div className="space-y-2 fade-in-up fade-in-up-delayed-3">
            <label
              htmlFor="password"
              className="text-xs tracking-luxury uppercase text-muted-foreground block"
            >
              New Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
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

          {/* Confirm Password Field */}
          <div className="space-y-2 fade-in-up fade-in-up-delayed-3">
            <label
              htmlFor="confirm-password"
              className="text-xs tracking-luxury uppercase text-muted-foreground block"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="luxury-input h-12 bg-transparent border-border/50 focus:border-[hsl(38,50%,55%,0.5)] transition-all duration-300 pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Dynamic password match indicator */}
            {confirmPassword.length > 0 && (
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
                  Updating...
                </span>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
