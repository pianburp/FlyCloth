import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "FlyCloth | Premium Custom Tailored & Luxury Fashion",
    template: "%s | FlyCloth",
  },
  description: "Discover timeless elegance and contemporary luxury at FlyCloth. Premium custom-tailored clothing, bespoke suits, and haute couture fashion crafted with unparalleled craftsmanship. Shop our exclusive collection today.",
  keywords: ["luxury fashion", "custom tailored", "bespoke clothing", "haute couture", "premium suits", "designer fashion", "FlyCloth", "tailored clothing", "luxury attire", "custom suits"],
  authors: [{ name: "FlyCloth" }],
  creator: "FlyCloth",
  publisher: "FlyCloth",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: defaultUrl,
    siteName: "FlyCloth",
    title: "FlyCloth | Premium Custom Tailored & Luxury Fashion",
    description: "Discover timeless elegance and contemporary luxury at FlyCloth. Premium custom-tailored clothing and haute couture fashion crafted with unparalleled craftsmanship.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FlyCloth - Luxury Fashion & Custom Tailoring",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FlyCloth | Premium Custom Tailored & Luxury Fashion",
    description: "Discover timeless elegance and contemporary luxury at FlyCloth. Premium custom-tailored clothing and haute couture fashion.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: defaultUrl,
  },
};

const playfair = Playfair_Display({
  variable: "--font-playfair",
  display: "swap",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${playfair.variable} ${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
