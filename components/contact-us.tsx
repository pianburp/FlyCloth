"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowRight, Facebook, Instagram, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Custom X/Twitter icon since lucide doesn't have it
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export function ContactUs() {
  return (
    <section className="w-full bg-background overflow-hidden">
      {/* Editorial Campaign Section */}
      <div className="relative min-h-[80vh] flex items-center">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80"
            alt="Campaign Editorial"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <p className="text-xs tracking-luxury uppercase text-white/60 mb-6">
                Campaign Fall/Winter 2025
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight mb-6">
                The Art of
                <span className="block italic font-medium">Reinvention</span>
              </h2>
              <p className="text-lg text-white/80 font-light leading-relaxed mb-8 max-w-lg">
                Our latest campaign celebrates the transformative power of fashion.
                Each piece is a testament to our commitment to excellence and innovation.
              </p>
              <Button
                asChild
                className="bg-white text-black hover:bg-white/90 px-8 py-6 text-xs tracking-luxury uppercase font-medium"
              >
                <Link href="/campaign">
                  Discover the Campaign
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>

            {/* Stats/Highlights */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:grid grid-cols-2 gap-8"
            >
              {[
                { number: "25+", label: "Years of Excellence" },
                { number: "150", label: "Exclusive Designs" },
                { number: "48", label: "Countries Worldwide" },
                { number: "∞", label: "Moments of Elegance" },
              ].map((stat, idx) => (
                <div key={idx} className="text-center text-white border border-white/20 p-8">
                  <p className="text-4xl font-light mb-2">{stat.number}</p>
                  <p className="text-xs tracking-luxury uppercase text-white/60">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="py-32 bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <p className="text-xs tracking-luxury uppercase text-muted-foreground mb-4">
              Stay Connected
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-6">
              Join the Inner Circle
            </h2>
            <p className="text-muted-foreground font-light leading-relaxed mb-10">
              Be the first to discover new collections, receive exclusive invitations
              to private events, and enjoy special privileges reserved for our most valued patrons.
            </p>

            <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-14 px-6 bg-background border-border/50 text-sm placeholder:text-muted-foreground/60 focus:border-foreground"
              />
              <Button
                type="submit"
                className="h-14 px-8 text-xs tracking-luxury uppercase font-medium"
              >
                Subscribe
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <p className="text-xs text-muted-foreground/60 mt-6">
              By subscribing, you agree to receive marketing communications.
              View our <Link href="/privacy" className="underline hover:text-foreground transition-colors">Privacy Policy</Link>.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Boutique Locations */}
      <div className="py-24 border-t border-border/50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-sm tracking-luxury uppercase text-muted-foreground mb-6">
                Our Boutiques
              </h3>
            </motion.div>

            {[
              { city: "Kuala Lumpur", address: "Pavilion, Level 3", hours: "10am – 10pm" },
              { city: "Singapore", address: "ION Orchard", hours: "10am – 10pm" },
              { city: "Paris", address: "Avenue Montaigne", hours: "10am – 7pm" },
            ].map((boutique, idx) => (
              <motion.div
                key={boutique.city}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: (idx + 1) * 0.1 }}
                className="space-y-2"
              >
                <h4 className="text-lg font-light">{boutique.city}</h4>
                <p className="text-sm text-muted-foreground">{boutique.address}</p>
                <p className="text-xs text-muted-foreground/60">{boutique.hours}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="py-12 border-t border-border/50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-muted-foreground font-light">
              Follow us @flycloth
            </p>
            <div className="flex items-center gap-8">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                <XIcon className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@flycloth.com"
                className="text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
