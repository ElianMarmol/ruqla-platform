'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Award, ShieldCheck, Truck } from 'lucide-react';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from '@/components/ui/carousel';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MainBanner } from '@/types';

const HERO_VALUE_PROPS = [
  { icon: Award, title: 'CALIDAD PREMIUM' },
  { icon: Truck, title: 'ENVÍOS RÁPIDOS' },
  { icon: ShieldCheck, title: 'COMPRA SEGURA' },
] as const;

function splitTitleAccent(title: string) {
  const words = title.trim().split(/\s+/);
  if (words.length <= 1) {
    return { lead: title, accent: '' };
  }
  const accent = words.pop() ?? '';
  return { lead: words.join(' '), accent };
}

function HeroValueProps({ compact }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        'flex flex-col justify-center gap-3 border-border/60',
        compact
          ? 'hidden xl:flex xl:border-l xl:pl-4'
          : 'hidden xl:flex xl:border-l xl:pl-6 xl:gap-6'
      )}
    >
      {HERO_VALUE_PROPS.map(({ icon: Icon, title }) => (
        <div key={title} className="flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
            <Icon className="size-4" strokeWidth={2} aria-hidden />
          </div>
          <p className="font-sans text-[10px] font-bold tracking-wide text-foreground leading-tight">
            {title}
          </p>
        </div>
      ))}
    </div>
  );
}

function HeroSlide({
  banner,
  compact,
}: {
  banner: MainBanner;
  compact?: boolean;
}) {
  const { lead, accent } = splitTitleAccent(banner.title);

  return (
    <div className="rounded-2xl lg:rounded-3xl bg-muted/80 border border-border overflow-hidden h-full">
      <div
        className={cn(
          'grid items-center h-full',
          compact
            ? 'gap-3 p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)_auto] lg:gap-4 lg:p-4'
            : 'gap-6 p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)_auto] lg:p-10'
        )}
      >
        <div className="flex flex-col justify-center space-y-2 lg:space-y-2.5 order-2 lg:order-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            Tecnología que te acompaña
          </p>

          <h1
            className={cn(
              'font-sans font-extrabold leading-[1.1] tracking-tight text-foreground',
              compact
                ? 'text-xl sm:text-2xl lg:text-[1.65rem]'
                : 'text-3xl sm:text-4xl lg:text-5xl'
            )}
          >
            {accent ? (
              <>
                {lead} <span className="text-primary">{accent}</span>
              </>
            ) : (
              <span className="text-primary">{banner.title}</span>
            )}
          </h1>

          {banner.subtitle && !compact ? (
            <p className="text-sm text-muted-foreground font-body max-w-md line-clamp-2">
              {banner.subtitle}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2 pt-0.5">
            {banner.button_text && banner.button_link ? (
              <Link
                href={banner.button_link}
                className={buttonVariants({
                  size: 'sm',
                  className: 'rounded-full font-bold px-5 h-9 text-xs',
                })}
              >
                {banner.button_text}
              </Link>
            ) : (
              <Link
                href="/productos"
                className={buttonVariants({
                  size: 'sm',
                  className: 'rounded-full font-bold px-5 h-9 text-xs',
                })}
              >
                VER PRODUCTOS →
              </Link>
            )}
          </div>
        </div>

        <div className="order-1 lg:order-2 flex items-center justify-center min-h-0">
          <div
            className={cn(
              'relative w-full rounded-xl overflow-hidden bg-white shadow-sm',
              compact
                ? 'h-[140px] sm:h-[160px] lg:h-[min(22vh,200px)] max-w-sm mx-auto'
                : 'aspect-[4/3] max-w-md h-[200px] lg:h-[280px]'
            )}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${banner.image_url})` }}
              role="img"
              aria-label={banner.title}
            />
          </div>
        </div>

        <div className="order-3 hidden lg:block">
          <HeroValueProps compact={compact} />
        </div>
      </div>
    </div>
  );
}

function HeroCarouselDots({ count }: { count: number }) {
  const { api } = useCarousel();
  const [selected, setSelected] = useState(0);
  const [visible, setVisible] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevIndexRef = useRef(0);
  const isInitializedRef = useRef(false);

  const scheduleHide = useCallback(() => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => setVisible(false), 2500);
  }, []);

  const showDots = useCallback(() => {
    setVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  const onSelect = useCallback(() => {
    if (!api) return;

    const index = api.selectedScrollSnap();
    if (isInitializedRef.current && index !== prevIndexRef.current) {
      showDots();
    }

    isInitializedRef.current = true;
    prevIndexRef.current = index;
    setSelected(index);
  }, [api, showDots]);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!api || count <= 1) return;

    onSelect();
    api.on('select', onSelect);
    api.on('reInit', onSelect);

    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api, count, onSelect]);

  if (count <= 1) return null;

  return (
    <div
      className={cn(
        'absolute inset-x-0 bottom-0 z-10 flex justify-center gap-1.5 bg-gradient-to-t from-muted/80 via-muted/30 to-transparent px-4 pb-2 pt-4 transition-opacity duration-300 sm:pb-2.5',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => {
            api?.scrollTo(i);
            showDots();
          }}
          className={cn(
            'size-1.5 rounded-full transition-colors',
            i === selected
              ? 'bg-primary scale-110'
              : 'bg-foreground/25 hover:bg-foreground/40'
          )}
          aria-label={`Ir al banner ${i + 1}`}
          aria-current={i === selected ? 'true' : undefined}
          tabIndex={visible ? 0 : -1}
        />
      ))}
    </div>
  );
}

const FALLBACK_BANNER: MainBanner = {
  id: 'fallback',
  title: 'Accesorios que van con vos.',
  subtitle:
    'Cargadores, fundas, auriculares y más. Calidad, diseño y practicidad en un solo lugar.',
  image_url:
    'https://images.unsplash.com/photo-1695048062967-61e7b1a5b0b1?w=800&q=80',
  button_text: 'VER PRODUCTOS →',
  button_link: '/productos',
  is_active: true,
  order_index: 0,
  created_at: new Date().toISOString(),
};

type HeroCarouselProps = {
  banners: MainBanner[];
  compact?: boolean;
};

export default function HeroCarousel({ banners, compact }: HeroCarouselProps) {
  const slides = banners.length > 0 ? banners : [FALLBACK_BANNER];

  return (
    <section
      className={cn(
        'home-hero shrink-0 px-4 md:px-6 lg:px-8',
        compact ? 'pt-2 pb-0 lg:flex-[1.15] lg:min-h-0' : 'pt-5 pb-3'
      )}
    >
      <div className="max-w-7xl mx-auto h-full flex flex-col min-h-0">
        <Carousel
          className="relative w-full flex-1 min-h-0 flex flex-col"
          opts={{
            loop: slides.length > 1,
          }}
        >
          <div className="relative flex-1 min-h-0">
            <CarouselContent className="h-full min-h-0 -ml-0">
              {slides.map((banner) => (
                <CarouselItem key={banner.id} className="pl-0 basis-full">
                  <HeroSlide banner={banner} compact={compact} />
                </CarouselItem>
              ))}
            </CarouselContent>

            <HeroCarouselDots count={slides.length} />
          </div>
        </Carousel>

        {compact ? (
          <div className="flex justify-center gap-6 py-2 lg:hidden border-t border-border/40 mt-2">
            {HERO_VALUE_PROPS.map(({ icon: Icon, title }) => (
              <div key={title} className="flex items-center gap-1.5">
                <Icon className="size-3.5 text-primary" aria-hidden />
                <span className="text-[9px] font-bold text-foreground">{title}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
