'use client';

import { MainBanner } from "@/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function HeroCarousel({ banners }: { banners: MainBanner[] }) {
  if (!banners || banners.length === 0) return null;

  return (
    <div className="w-full relative group">
      <Carousel 
        className="w-full"
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              <div className="relative w-full h-[500px] md:h-[600px] flex items-center overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                  style={{ backgroundImage: `url(${banner.image_url})` }}
                />

                <div className="absolute inset-0 bg-black/40 z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent z-10" />

                <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full flex flex-col justify-center h-full">
                  <div className="max-w-2xl space-y-6">
                    <h1 className="text-5xl md:text-7xl font-sans font-extrabold text-foreground leading-[1.1] tracking-tighter drop-shadow-2xl">
                      {banner.title}
                    </h1>
                    {banner.subtitle && (
                      <p className="text-xl md:text-2xl text-muted-foreground font-body max-w-xl font-medium">
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.button_text && banner.button_link && (
                      <div className="pt-4">
                        <Link 
                          href={banner.button_link}
                          className={buttonVariants({ 
                            size: "lg", 
                            className: "font-sans font-bold text-lg rounded-full px-8 py-7 shadow-[0_0_20px_rgba(159,192,48,0.3)] hover:shadow-[0_0_30px_rgba(159,192,48,0.5)] transition-all" 
                          })}
                        >
                          {banner.button_text}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {banners.length > 1 && (
          <div className="hidden md:flex justify-end absolute bottom-8 right-12 z-30 gap-3">
            <CarouselPrevious className="static translate-y-0 h-12 w-12 bg-background/50 border-border/50 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors" />
            <CarouselNext className="static translate-y-0 h-12 w-12 bg-background/50 border-border/50 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors" />
          </div>
        )}
      </Carousel>
    </div>
  );
}
