"use client";

import { memo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ShirtIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { ProductWithMediaUrls } from "@/types";

interface ProductCardProps {
    product: ProductWithMediaUrls;
    index: number;
    featured?: boolean;
}

/**
 * Luxury product card with video hover-to-play functionality.
 * Memoized for performance in product grids.
 */
export const ProductCard = memo(function ProductCard({
    product,
    index,
    featured = false,
}: ProductCardProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const isLowStock = product.product_variants?.some((v) => v.stock_quantity < 25);

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (videoRef.current && product.videoUrl) {
            videoRef.current.play().catch(() => { });
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
        >
            <Link
                href={`/user/products/${product.id}`}
                className="group block"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div
                    className={`relative overflow-hidden bg-muted mb-4 ${featured ? "aspect-[3/4]" : "aspect-square"
                        }`}
                >
                    {/* Video (hidden until hover) */}
                    {product.videoUrl && (
                        <video
                            ref={videoRef}
                            src={product.videoUrl}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"
                                }`}
                            muted
                            loop
                            playsInline
                        />
                    )}

                    {/* Image (shows when not hovering or no video) */}
                    {product.imageUrl ? (
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            sizes={
                                featured
                                    ? "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    : "(max-width: 768px) 50vw, 25vw"
                            }
                            className={`object-cover transition-all duration-700 ${isHovered && product.videoUrl ? "opacity-0" : "opacity-100"
                                } group-hover:scale-105`}
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                            <ShirtIcon className="w-12 h-12 text-muted-foreground/30" />
                        </div>
                    )}

                    {/* Overlay on hover */}
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

                    {/* Quick View */}
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

// Alias for backward compatibility
export const LuxuryProductCard = ProductCard;
