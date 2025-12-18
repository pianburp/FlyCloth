"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      {success ? (
        /* Success State */
        <div className="luxury-card p-8 md:p-10 fade-in-up">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[hsl(38,50%,55%,0.1)] flex items-center justify-center scale-in">
              <CheckCircle className="w-10 h-10 text-[hsl(38,50%,55%)]" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-light tracking-tight mb-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
              Check Your Email
            </h1>
            <p className="text-sm text-muted-foreground font-light">
              Password reset instructions sent
            </p>
          </div>

          {/* Gold Divider */}
          <div className="gold-divider mb-6" />

          {/* Message */}
          <p className="text-sm text-muted-foreground text-center font-light leading-relaxed">
            If you registered using your email and password, you will receive a password reset email at{" "}
            <span className="text-foreground">{email}</span>.
          </p>

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <Link
              href="/auth/login"
              className="text-sm text-foreground hover:text-[hsl(38,50%,55%)] transition-colors luxury-underline"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      ) : (
        /* Form State */
        <div className="luxury-card p-8 md:p-10 fade-in-up">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center fade-in-up fade-in-up-delayed-1">
              <Mail className="w-7 h-7 text-muted-foreground" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-xs tracking-luxury uppercase text-muted-foreground mb-3 block fade-in-up fade-in-up-delayed-1">
              Forgot Password
            </span>
            <h1 className="text-3xl font-light tracking-tight mb-2 fade-in-up fade-in-up-delayed-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
              Reset Password
            </h1>
            <p className="text-sm text-muted-foreground font-light fade-in-up fade-in-up-delayed-2">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>

          {/* Gold Divider */}
          <div className="gold-divider mb-8 fade-in-up fade-in-up-delayed-2" />

          {/* Form */}
          <form onSubmit={handleForgotPassword} className="space-y-6">
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
                    Sending...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center fade-in-up fade-in-up-delayed-4">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link
                href="/auth/login"
                className="text-foreground hover:text-[hsl(38,50%,55%)] transition-colors luxury-underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
