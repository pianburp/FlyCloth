import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardContent } from "@/components/ui/card";

export function Hero() {
  return (
    <section className="relative w-full h-screen flex items-center overflow-hidden bg-neutral-900">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/video/hero.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-[1]" />

      <div className="relative z-10 container mx-auto px-4 flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-12">
        <div className="flex-1 text-center lg:text-left text-white fade-in-up">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            FlyCloth — Modern, Comfortable Clothing
          </h1>
          <p className="mt-4 text-lg text-gray-200 max-w-xl mx-auto lg:mx-0">
            Discover high quality apparel for every season. Crafted from premium
            fabrics with sustainability in mind.
          </p>
          <div className="mt-6 flex items-center justify-center lg:justify-start gap-3">
            <Button asChild className="bg-white text-black hover:bg-gray-200">
              <Link href="/shop" className="inline-flex">Shop Now</Link>
            </Button>
            <Button asChild variant="outline" className="bg-transparent text-white border-white hover:bg-white/20 hover:text-white">
              <Link href="/collections">View Collections</Link>
            </Button>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 justify-end">
          <Card className="w-full max-w-md overflow-hidden fade-in-up fade-in-up-delayed-1 bg-white/10 border-white/20 backdrop-blur-sm">
            <div className="relative aspect-[4/3] w-full rounded-md overflow-hidden flex items-end">
              <Image 
                src="/images/baju.jpg" 
                alt="Summer Linen Shirt" 
                fill 
                className="object-cover"
                priority
              />
              {/* Gradient overlay for improved contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              <CardContent className="p-6 text-white relative z-10">
                <CardTitle className="text-xl">Summer Linen Shirt</CardTitle>
                <p className="text-sm mt-1">Lightweight. Breathable. Timeless.</p>
                <div className="mt-4 text-sm font-semibold">RM49.00</div>
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
