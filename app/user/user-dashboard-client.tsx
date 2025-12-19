"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ShirtIcon, Star, ArrowUpRight, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductCard } from "@/components/product/product-card";
import type {
    ProductWithRelations,
    ProductWithMediaUrls,
    ProfileSummary
} from "@/types";

interface UserDashboardClientProps {
    initialProfile: ProfileSummary | null;
    initialFeaturedProducts: ProductWithRelations[];
    initialAllProducts: ProductWithRelations[];
}

export default function UserDashboardClient({
    initialProfile,
    initialFeaturedProducts,
    initialAllProducts,
}: UserDashboardClientProps) {
    // Filter state
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sortBy, setSortBy] = useState<"newest" | "best_selling" | "price_low" | "price_high">("newest");
    const [fitFilter, setFitFilter] = useState<"all" | "slim" | "regular" | "oversize">("all");

    // Create Supabase client once for media URLs
    const supabase = useMemo(() => createClient(), []);

    // Pre-compute media URLs for all products
    const getMediaUrls = (product: ProductWithRelations): { imageUrl: string | null; videoUrl: string | null } => {
        const images = product.product_images || [];
        const imageMedia = images.find((m) => m.media_type === 'image');
        const videoMedia = images.find((m) => m.media_type === 'video');

        return {
            imageUrl: imageMedia ? supabase.storage.from('product-images').getPublicUrl(imageMedia.storage_path).data.publicUrl : null,
            videoUrl: videoMedia ? supabase.storage.from('product-images').getPublicUrl(videoMedia.storage_path).data.publicUrl : null
        };
    };

    const featuredProducts = useMemo(() =>
        initialFeaturedProducts.map((p) => ({ ...p, ...getMediaUrls(p) })),
        [initialFeaturedProducts]
    );

    const allProducts = useMemo(() =>
        initialAllProducts.map((p) => ({ ...p, ...getMediaUrls(p) })),
        [initialAllProducts]
    );

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        let filtered = [...allProducts];

        // Apply price range filter
        if (minPrice) {
            filtered = filtered.filter(p => p.base_price >= parseFloat(minPrice));
        }
        if (maxPrice) {
            filtered = filtered.filter(p => p.base_price <= parseFloat(maxPrice));
        }

        // Apply fit filter
        if (fitFilter !== "all") {
            filtered = filtered.filter(p =>
                p.product_variants?.some(v => v.fit === fitFilter)
            );
        }

        // Apply sorting
        switch (sortBy) {
            case "best_selling":
                filtered.sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0));
                break;
            case "price_low":
                filtered.sort((a, b) => a.base_price - b.base_price);
                break;
            case "price_high":
                filtered.sort((a, b) => b.base_price - a.base_price);
                break;
            case "newest":
            default:
                // Already sorted by created_at desc from query
                break;
        }

        return filtered;
    }, [allProducts, minPrice, maxPrice, fitFilter, sortBy]);

    const hasActiveFilters = minPrice !== "" || maxPrice !== "" || fitFilter !== "all" || sortBy !== "newest";

    const clearFilters = () => {
        setMinPrice("");
        setMaxPrice("");
        setFitFilter("all");
        setSortBy("newest");
    };

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
                        <span className="block font-medium italic">{initialProfile?.full_name || "Valued Customer"}</span>
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
                            <ProductCard key={product.id} product={product} index={idx} featured />
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
                </motion.div>

                {/* Filter Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <div className="luxury-card overflow-hidden">
                        {/* Filter Header */}
                        <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm tracking-luxury uppercase text-muted-foreground">
                                    Filter & Sort
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-muted-foreground">
                                    {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                                </span>
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="text-xs tracking-luxury uppercase h-7 px-2"
                                    >
                                        Clear <X className="ml-1 w-3 h-3" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Filter Controls */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                                {/* Sort By */}
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground font-light">Sort By</Label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="newest">Newest</option>
                                        <option value="best_selling">Best Selling</option>
                                        <option value="price_low">Price: Low to High</option>
                                        <option value="price_high">Price: High to Low</option>
                                    </select>
                                </div>

                                {/* Fit Type */}
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground font-light">Fit Type</Label>
                                    <select
                                        value={fitFilter}
                                        onChange={(e) => setFitFilter(e.target.value as typeof fitFilter)}
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="all">All Fits</option>
                                        <option value="slim">Slim Fit</option>
                                        <option value="regular">Regular Fit</option>
                                        <option value="oversize">Oversize Fit</option>
                                    </select>
                                </div>

                                {/* Min Price */}
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground font-light">Min Price (RM)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        min="0"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="h-10"
                                    />
                                </div>

                                {/* Max Price */}
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground font-light">Max Price (RM)</Label>
                                    <Input
                                        type="number"
                                        placeholder="Any"
                                        min="0"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="h-10"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    {filteredProducts?.map((product, idx) => (
                        <ProductCard key={product.id} product={product} index={idx} />
                    ))}

                    {filteredProducts.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full text-center py-20"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                                <ShirtIcon className="w-10 h-10 text-muted-foreground/50" />
                            </div>
                            <p className="text-muted-foreground font-light mb-4">
                                {hasActiveFilters ? "No products match your filters." : "No products available at the moment."}
                            </p>
                            {hasActiveFilters && (
                                <Button variant="outline" onClick={clearFilters} className="text-xs tracking-luxury uppercase">
                                    Clear Filters
                                </Button>
                            )}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Custom Printed Shirts Section */}
            <section className="py-20 scroll-mt-8">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative overflow-hidden rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 md:p-12"
                >
                    {/* Subtle gradient overlay for texture */}
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="text-center lg:text-left max-w-xl">
                            <Badge className="mb-4 bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-sm text-xs tracking-luxury uppercase px-4 py-1.5">
                                Custom Orders
                            </Badge>
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-tight text-white mb-4">
                                Need Custom
                                <span className="block italic font-medium">Printed Shirts?</span>
                            </h2>
                            <p className="text-sm md:text-base text-white/70 font-light leading-relaxed mb-6">
                                We also handle bulk orders and custom printed shirts for events, teams, and businesses.
                                Get premium quality with your own designs printed on high-quality fabrics.
                            </p>
                            <a
                                href="https://wa.me/60179544533"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-xs tracking-luxury uppercase font-medium gap-2">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    Chat on WhatsApp
                                </Button>
                            </a>
                        </div>
                        <div className="flex-shrink-0">
                            <div className="w-40 h-40 md:w-52 md:h-52 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                <ShirtIcon className="w-16 h-16 md:w-20 md:h-20 text-white/40" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
