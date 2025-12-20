"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export interface PromotedProduct {
  id: string;
  name: string;
  description: string;
  base_price: number;
  product_images: { storage_path: string; is_primary: boolean }[];
}

const CATEGORIES = [
  {
    name: "Slim Fit Collection",
    image: "https://images.unsplash.com/photo-1594938328870-9623159c8c99?w=600&q=80",
    count: "Tailored Silhouette",
    href: "/user/products"
  },
  {
    name: "Regular Fit Classics",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    count: "Everyday Comfort",
    href: "/user/products"
  },
  {
    name: "Oversized Streetwear",
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80",
    count: "Modern Aesthetic",
    href: "/user/products"
  },
  {
    name: "Premium Heavyweight",
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80",
    count: "Luxury GSM",
    href: "/user/products"
  },
];

interface FeaturesProps {
  promotedProducts?: any[]; // Using any[] to avoid strict type coupling temporarily
}

export function Features({ promotedProducts = [] }: FeaturesProps) {
  const containerRef = useRef(null);
  const supabase = createClient();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const getImageUrl = (product: any) => {
    const images = product.product_images || [];
    const primaryImage = images.find((img: any) => img.is_primary) || images[0];
    if (primaryImage) {
      return supabase.storage.from('product-images').getPublicUrl(primaryImage.storage_path).data.publicUrl;
    }
    return "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80"; // Fallback
  };

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [50, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  // Use promoted products if available, otherwise fallback (or show empty state)
  const displayItems = promotedProducts.length > 0 ? promotedProducts : [];

  return (
    <section ref={containerRef} className="relative w-full py-32 bg-background overflow-hidden" id="features">
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
              Latest Additions
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight">
              Fresh from the
              <span className="block italic font-medium">Atelier</span>
            </h2>
          </div>
          <Link
            href="/user/products"
            className="group flex items-center gap-2 text-sm tracking-luxury uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            View All Products
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          </Link>
        </motion.div>

        {displayItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {displayItems.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.15 }}
              >
                <Link href={`/user/products/${product.id}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-6">
                    <Image
                      src={getImageUrl(product)}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority={idx === 0}
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />

                    {/* Quick View */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <span className="bg-white text-black px-6 py-3 text-xs tracking-luxury uppercase transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        View Product
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs tracking-luxury uppercase text-muted-foreground">
                      New Arrival
                    </p>
                    <h3 className="text-xl font-light tracking-tight group-hover:text-muted-foreground transition-colors duration-300">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground font-light leading-relaxed line-clamp-2">
                      {product.description}
                    </p>
                    <p className="text-sm font-medium pt-2">
                      RM {product.base_price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground font-light">New collections arriving soon.</p>
          </div>
        )}
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
                  sizes="(max-width: 1024px) 50vw, 25vw"
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
