import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { PromoBanner } from '@/types';

type PromoGridProps = {
  banners: PromoBanner[];
};

export default function PromoGrid({ banners }: PromoGridProps) {
  if (!banners.length) return null;

  return (
    <section className="py-12 md:py-16 bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2">
            RUQLA
          </p>
          <h2 className="font-sans text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Ofertas y Promociones
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((banner) => {
            const isFull = banner.size === 'full';
            const card = (
              <article
                className={cn(
                  'group relative min-h-[220px] sm:min-h-[260px] md:min-h-[280px] rounded-2xl overflow-hidden border border-border shadow-sm',
                  'transition-all duration-300 hover:shadow-md',
                  isFull ? 'md:col-span-2' : 'col-span-1'
                )}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${banner.image_url})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="relative z-10 flex h-full min-h-[inherit] flex-col justify-end p-6 sm:p-8">
                  <h3 className="font-sans text-2xl sm:text-3xl font-extrabold text-white tracking-tight max-w-xl">
                    {banner.title}
                  </h3>
                  {banner.subtitle && (
                    <p className="mt-2 text-sm sm:text-base text-white/85 font-body max-w-lg line-clamp-2">
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.link_url && (
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary group-hover:gap-2.5 transition-all">
                      Ver más
                      <ArrowUpRight className="size-4" />
                    </span>
                  )}
                </div>
              </article>
            );

            if (banner.link_url) {
              return (
                <Link
                  key={banner.id}
                  href={banner.link_url}
                  className={cn(
                    'block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl',
                    isFull ? 'md:col-span-2' : 'col-span-1'
                  )}
                >
                  {card}
                </Link>
              );
            }

            return (
              <div
                key={banner.id}
                className={isFull ? 'md:col-span-2' : 'col-span-1'}
              >
                {card}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
