import { Suspense } from "react";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <p className="text-sm text-muted-foreground text-center font-light leading-relaxed">
      {params?.error ? (
        <>Error code: <span className="text-foreground font-mono text-xs">{params.error}</span></>
      ) : (
        "An unspecified error occurred. Please try again or contact support if the problem persists."
      )}
    </p>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <div className="luxury-card p-8 md:p-10 fade-in-up">
      {/* Warning Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center scale-in">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <span className="text-xs tracking-luxury uppercase text-muted-foreground mb-3 block">
          Authentication Error
        </span>
        <h1 className="text-3xl font-light tracking-tight mb-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          Something Went Wrong
        </h1>
      </div>

      {/* Gold Divider */}
      <div className="gold-divider mb-6" />

      {/* Error Message */}
      <Suspense fallback={
        <p className="text-sm text-muted-foreground text-center">Loading...</p>
      }>
        <ErrorContent searchParams={searchParams} />
      </Suspense>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center h-12 px-6 luxury-button-gold text-white font-light tracking-wide uppercase text-sm transition-all"
        >
          Try Again
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-12 px-6 border border-border/50 text-foreground font-light tracking-wide uppercase text-sm hover:bg-muted/50 transition-all"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
