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
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl"
                >
                    {/* Background Effects */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

                    <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
                        <div className="text-center lg:text-left max-w-xl">
                            <Badge className="mb-6 bg-white/5 text-white hover:bg-white/10 border border-white/20 backdrop-blur-md text-[10px] tracking-[0.2em] uppercase px-4 py-2 font-light">
                                Custom Services
                            </Badge>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extralight tracking-tight text-white mb-6 leading-tight">
                                Bespoke
                                <span className="block font-medium italic bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/50">
                                    Printing Solutions
                                </span>
                            </h2>
                            <p className="text-sm md:text-lg text-white/60 font-light leading-relaxed mb-8">
                                Elevate your brand or event with our premium custom printing service.
                                We combine high-quality fabrics with precision printing for a result that truly stands out.
                            </p>
                            <a
                                href="https://wa.me/60179544533"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button className="h-12 px-8 bg-white text-black hover:bg-white/90 font-medium text-xs tracking-[0.15em] uppercase transition-all duration-300 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.5)]">
                                    Start Custom Project
                                </Button>
                            </a>
                        </div>

                        <div className="flex-shrink-0 relative group">
                            {/* Decorative rings */}
                            <div className="absolute inset-0 rounded-full border border-white/5 scale-125 group-hover:scale-110 transition-transform duration-700 ease-out" />
                            <div className="absolute inset-0 rounded-full border border-white/5 scale-150 group-hover:scale-125 transition-transform duration-700 delay-75 ease-out" />

                            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-b from-white/10 to-transparent border border-white/10 flex items-center justify-center backdrop-blur-md relative overflow-hidden">
                                <div className="absolute inset-0 bg-noise opacity-10" />
                                <ShirtIcon className="w-20 h-20 md:w-28 md:h-28 text-white/80 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transform group-hover:scale-110 transition-transform duration-500" strokeWidth={1} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
