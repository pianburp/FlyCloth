import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
    title: "FlyCloth | Authentication",
    description: "Sign in to your luxury fashion account",
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full flex">
            {/* Left side - Form area */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-background relative overflow-hidden">
                {/* Gold accent line at top */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--gold))] to-transparent opacity-40" />

                {/* Gold accent line at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--gold))] to-transparent opacity-20" />

                <div className="w-full max-w-md relative z-10">
                    {children}
                </div>
            </div>

            {/* Right side - Image panel (hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
                {/* Background Image */}
                <Image
                    src="https://images.unsplash.com/photo-1598363777525-4818477ba9f9?q=80&w=713&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Luxury fashion"
                    fill
                    className="object-cover"
                    priority
                    sizes="(min-width: 1280px) 60vw, (min-width: 1024px) 50vw, 0vw"
                />

                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-black/40" />

                {/* Gold gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col justify-between p-12 z-10">
                    {/* Top - Brand mark */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-4xl xl:text-5xl font-light text-white tracking-wide" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                                FlyCloth
                            </h1>
                        </div>
                        {/* Corner accent */}
                        <div className="w-16 h-16 border-r border-t border-[hsl(var(--gold)/0.5)]" />
                    </div>

                    {/* Bottom - Tagline */}
                    <div>
                        <div className="w-20 h-px bg-gradient-to-r from-[hsl(var(--gold))] to-transparent mb-6" />
                        <p className="text-lg xl:text-xl text-white/90 font-light max-w-md leading-relaxed mb-4" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                            &ldquo;Where elegance meets exceptional craftsmanship&rdquo;
                        </p>

                        {/* Bottom decorative elements */}
                        <div className="flex items-center gap-8 mt-8 text-white/40">
                            <span className="text-xs tracking-luxury uppercase">Est. 2025</span>
                        </div>
                    </div>
                </div>

                {/* Bottom corner accent */}
                <div className="absolute bottom-8 right-8 w-16 h-16 border-r border-b border-[hsl(var(--gold)/0.4)] z-10" />
            </div>
        </div>
    );
}
