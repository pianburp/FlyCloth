"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const COLLECTIONS = [
  {
    id: 1,
    title: "The Noir Collection",
    subtitle: "Winter 2025",
    description: "Explore the depths of sophistication with our signature black pieces.",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
    price: "From RM 2,450",
    href: "/collections/noir"
  },
  {
    id: 2,
    title: "Ivory Dreams",
    subtitle: "Bridal Couture",
    description: "Ethereal elegance for your most precious moments.",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
    price: "From RM 8,900",
    href: "/collections/bridal"
  },
  {
    id: 3,
    title: "Evening Soirée",
    subtitle: "Gala Collection",
    description: "Statement pieces designed to captivate and command attention.",
    image: "https://images.unsplash.com/photo-1518577915332-c2a19f149a75?w=800&q=80",
    price: "From RM 4,200",
    href: "/collections/evening"
  },
];

const CATEGORIES = [
  {
    name: "Ready-to-Wear",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80",
    count: "48 pieces",
    href: "/shop/ready-to-wear"
  },
  {
    name: "Haute Couture",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    count: "24 pieces",
    href: "/shop/haute-couture"
  },
  {
    name: "Accessories",
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&q=80",
    count: "36 pieces",
    href: "/shop/accessories"
  },
  {
    name: "Limited Edition",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80",
    count: "12 pieces",
    href: "/shop/limited"
  },
];

export function Features() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [50, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="w-full py-32 bg-background overflow-hidden" id="features">
      {/* Collections Grid */}
      <div className="container mx-auto px-6 lg:px-12 mb-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6"
        >
          <div className="max-w-2xl">
            <p className="text-xs tracking-luxury uppercase text-muted-foreground mb-4">
              Featured Collections
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight">
              Curated for the
              <span className="block italic font-medium">Discerning Eye</span>
            </h2>
          </div>
          <Link
            href="/collections"
            className="group flex items-center gap-2 text-sm tracking-luxury uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            View All Collections
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {COLLECTIONS.map((collection, idx) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.15 }}
            >
              <Link href={collection.href} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-6">
                  <Image
                    src={collection.image}
                    alt={collection.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />

                  {/* Quick View */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="bg-white text-black px-6 py-3 text-xs tracking-luxury uppercase transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      Discover
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs tracking-luxury uppercase text-muted-foreground">
                    {collection.subtitle}
                  </p>
                  <h3 className="text-xl font-light tracking-tight group-hover:text-muted-foreground transition-colors duration-300">
                    {collection.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">
                    {collection.description}
                  </p>
                  <p className="text-sm font-medium pt-2">
                    {collection.price}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-luxury uppercase text-muted-foreground mb-4">
            Shop by Category
          </p>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight">
            Explore Our World
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {CATEGORIES.map((category, idx) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
            >
              <Link href={category.href} className="group block relative aspect-square overflow-hidden bg-muted">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                  <h3 className="text-lg md:text-xl font-light tracking-tight text-center">
                    {category.name}
                  </h3>
                  <p className="text-xs tracking-luxury uppercase mt-2 opacity-70">
                    {category.count}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
