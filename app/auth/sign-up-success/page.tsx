import { CheckCircle, Mail } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="luxury-card p-8 md:p-10 fade-in-up">
      {/* Success Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-[hsl(38,50%,55%,0.1)] flex items-center justify-center scale-in">
          <CheckCircle className="w-10 h-10 text-[hsl(38,50%,55%)]" />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <span className="text-xs tracking-luxury uppercase text-muted-foreground mb-3 block fade-in-up fade-in-up-delayed-1">
          Welcome
        </span>
        <h1 className="text-3xl font-light tracking-tight mb-2 fade-in-up fade-in-up-delayed-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          Thank You!
        </h1>
        <p className="text-sm text-muted-foreground font-light fade-in-up fade-in-up-delayed-2">
          Your account has been created successfully
        </p>
      </div>

      {/* Gold Divider */}
      <div className="gold-divider mb-6 fade-in-up fade-in-up-delayed-2" />

      {/* Email Icon & Message */}
      <div className="flex flex-col items-center text-center fade-in-up fade-in-up-delayed-3">
        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Mail className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-sm">
          Please check your email to confirm your account before signing in.
          The confirmation link will expire in 24 hours.
        </p>
      </div>

      {/* Action Button */}
      <div className="mt-8 text-center fade-in-up fade-in-up-delayed-4">
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center h-12 px-8 luxury-button-gold text-white font-light tracking-wide uppercase text-sm transition-all"
        >
          Continue to Sign In
        </Link>
      </div>

      {/* Additional Info */}
      <div className="mt-6 text-center fade-in-up fade-in-up-delayed-4">
        <p className="text-xs text-muted-foreground">
          Didn&apos;t receive an email?{" "}
          <button className="text-foreground hover:text-[hsl(38,50%,55%)] transition-colors luxury-underline">
            Resend confirmation
          </button>
        </p>
      </div>
    </div>
  );
}
