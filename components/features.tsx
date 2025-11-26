"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Shirt, Truck, RefreshCcw, Play, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

const FEATURES = [
  {
    title: "Premium Fabrics",
    description: "We carefully select materials for comfort and longevity. Our cotton is 100% organic and ethically sourced.",
    icon: Shirt,
    mediaType: "video",
    src: "/video/fabrics.mp4",
  },
  {
    title: "Free Shipping",
    description: "Enjoy free shipping on orders over $50 within the country. Track your package every step of the way.",
    icon: Truck,
    mediaType: "image",
    src: "/images/delivery.jpg",
  },
  {
    title: "Easy Returns",
    description: "Don't like it? Just send it back within 30 days for a full refund, no questions asked.",
    icon: RefreshCcw,
    mediaType: "image",
    src: "/images/return.jpg",
  },
];

export function Features() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const yTransforms = [
    useTransform(scrollYProgress, [0, 1], [0, -50]),
    useTransform(scrollYProgress, [0, 1], [50, -100]),
    useTransform(scrollYProgress, [0, 1], [0, -50]),
  ];

  return (
    <section ref={containerRef} className="w-full py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Designed for the Modern Lifestyle
            </h2>
            <p className="text-lg text-muted-foreground">
              We believe in quality, sustainability, and transparency. 
              Experience the difference with BajuNow.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {FEATURES.map((feature, idx) => (
            <motion.div 
              key={feature.title} 
              className="group flex flex-col gap-6"
              style={{ y: yTransforms[idx] }}
            >
              {/* Media Content */}
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted/30 border border-border/50 group-hover:border-border transition-colors duration-300">
                 {feature.mediaType === 'video' ? (
                   <video
                     autoPlay
                     loop
                     muted
                     playsInline
                     className="absolute inset-0 w-full h-full object-cover"
                   >
                     <source src={feature.src} type="video/mp4" />
                   </video>
                 ) : (
                   <Image 
                     src={feature.src} 
                     alt={feature.title}
                     fill
                     className="object-cover transition-transform duration-500 group-hover:scale-105"
                   />
                 )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/5 text-primary">
                    <feature.icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
