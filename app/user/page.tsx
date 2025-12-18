"use client";

import { useEffect, useState, useMemo, memo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ShirtIcon, Star, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ProductFilters } from "@/components/product";
import { PageSkeleton } from "@/components/shared/page-skeleton";

interface Product {
  id: string;
  name: string;
  sku: string;
  base_price: number;
  product_images?: { storage_path: string }[];
  product_variants?: { stock_quantity: number }[];
}

interface Category {
  id: string;
  name: string;
}

interface Profile {
  full_name: string;
}

// Pre-computed product with cached image URL to avoid re-computing on each render
interface ProductWithImageUrl extends Product {
  imageUrl: string | null;
}

export default function UserDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductWithImageUrl[]>([]);
  const [allProducts, setAllProducts] = useState<ProductWithImageUrl[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Supabase client once and memoize
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function fetchData() {
      // Get current user profile
      const { data: { user } } = await supabase.auth.getUser();

      // Fetch profile if user exists (don't block other fetches)
      const profilePromise = user
        ? supabase.from('profiles').select('full_name').eq('id', user.id).single()
        : Promise.resolve({ data: null });

      // Fetch all data in parallel for faster loading
      const [profileResult, categoriesResult, featuredResult, productsResult] = await Promise.all([
        profilePromise,
        supabase.from('categories').select('*').order('name'),
        supabase.from('products')
          .select('*, product_images(storage_path), product_variants(stock_quantity)')
          .eq('is_active', true)
          .eq('is_featured', true)
          .limit(3),
        supabase.from('products')
          .select('*, product_images(storage_path), product_variants(stock_quantity)')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(12),
      ]);

      setProfile(profileResult.data);
      setCategories(categoriesResult.data || []);

      // Pre-compute image URLs so LuxuryProductCard doesn't need to do it on every render
      const getImageUrl = (product: Product): string | null => {
        const imagePath = product.product_images?.[0]?.storage_path;
        if (!imagePath) return null;
        return supabase.storage.from('product-images').getPublicUrl(imagePath).data.publicUrl;
      };

      setFeaturedProducts(
        (featuredResult.data || []).map((p: Product) => ({ ...p, imageUrl: getImageUrl(p) }))
      );
      setAllProducts(
        (productsResult.data || []).map((p: Product) => ({ ...p, imageUrl: getImageUrl(p) }))
      );

      setLoading(false);
    }

    fetchData();
  }, [supabase]);

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="flex flex-col pb-16">
      {/* Luxury Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center bg-black -mx-4 sm:-mx-6 lg:-mx-8 -mt-16 pt-16">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/video/hero-user.mp4" type="video/mp4" />
        </video>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-black/50 z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70 z-[2]" />

        {/* Content */}
        <div className="relative z-[5] container mx-auto px-6 lg:px-12 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Badge className="mb-6 bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-sm text-xs tracking-luxury uppercase px-4 py-1.5">
              Welcome Back
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[0.95] text-white mb-4"
          >
            <span className="block">Hello,</span>
            <span className="block font-medium italic">{profile?.full_name || "Valued Customer"}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-xl text-sm sm:text-base text-white/70 font-light leading-relaxed mb-8"
          >
            Discover our curated collection of premium garments, crafted with
            unparalleled attention to detail for the discerning individual.
          </motion.p>
        </div>
      </section>

      {/* Featured Section */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section id="featured" className="py-24 scroll-mt-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6"
          >
            <div className="max-w-2xl">
              <p className="text-xs tracking-luxury uppercase text-muted-foreground mb-4 flex items-center gap-2">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                Featured Collection
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight leading-tight">
                Handpicked for
                <span className="block italic font-medium">Excellence</span>
              </h2>
            </div>
            <Link
              href="/user/products"
              className="group flex items-center gap-2 text-sm tracking-luxury uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              View All
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featuredProducts.map((product, idx) => (
              <LuxuryProductCard key={product.id} product={product} index={idx} featured />
            ))}
          </div>
        </section>
      )}

      {/* All Products Section */}
      <section id="products" className="py-16 scroll-mt-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="text-xs tracking-luxury uppercase text-muted-foreground mb-4">
            Shop by Style
          </p>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-8">
            Explore Our Collection
          </h2>
          <div className="flex justify-center">
            <ProductFilters categories={categories || []} />
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {allProducts?.map((product, idx) => (
            <LuxuryProductCard key={product.id} product={product} index={idx} />
          ))}

          {(!allProducts || allProducts.length === 0) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                <ShirtIcon className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground font-light">No products available at the moment.</p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

// Memoized product card to prevent unnecessary re-renders
const LuxuryProductCard = memo(function LuxuryProductCard({
  product,
  index,
  featured = false
}: {
  product: ProductWithImageUrl;
  index: number;
  featured?: boolean;
}) {
  const isLowStock = product.product_variants?.some((v) => v.stock_quantity < 25);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
    >
      <Link href={`/user/products/${product.id}`} className="group block">
        <div className={`relative overflow-hidden bg-muted mb-4 ${featured ? 'aspect-[3/4]' : 'aspect-square'}`}>
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes={featured ? "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" : "(max-width: 768px) 50vw, 25vw"}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <ShirtIcon className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}

          {/* Overlay on hover - using CSS transition only */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />

          {/* Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between">
            {featured && (
              <Badge className="bg-black/80 text-white border-none backdrop-blur-sm text-[10px] tracking-luxury uppercase">
                Featured
              </Badge>
            )}
            {isLowStock && (
              <Badge className="bg-amber-500/90 text-white border-none backdrop-blur-sm text-[10px] tracking-luxury uppercase ml-auto">
                Limited
              </Badge>
            )}
          </div>

          {/* Quick View - using CSS transition only */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <span className="bg-white text-black px-6 py-3 text-xs tracking-luxury uppercase transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              View Details
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] tracking-luxury uppercase text-muted-foreground">
            {product.sku}
          </p>
          <h3 className="text-sm font-light tracking-tight group-hover:text-muted-foreground transition-colors duration-300 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm font-medium">
            RM {product.base_price.toLocaleString()}
          </p>
        </div>
      </Link>
    </motion.div>
  );
});
