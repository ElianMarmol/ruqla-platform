'use client';

import { Gift } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type NewsletterSectionProps = {
  compact?: boolean;
};

export default function NewsletterSection({ compact }: NewsletterSectionProps) {
  return (
    <section
      className={cn(
        'home-newsletter shrink-0 bg-background',
        compact
          ? 'py-2 lg:py-1.5 lg:flex-none'
          : 'pb-8 pt-4 md:pb-10 md:pt-6'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div
          className={cn(
            'w-full bg-primary flex flex-col lg:flex-row lg:items-center',
            compact
              ? 'rounded-full px-4 py-2.5 gap-2.5 sm:px-5 sm:py-3 lg:gap-5'
              : 'rounded-2xl lg:rounded-3xl px-5 py-7 md:px-8 md:py-8 gap-5 lg:gap-8'
          )}
        >
          <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
            <div
              className={cn(
                'flex shrink-0 items-center justify-center rounded-full bg-white/20 text-primary-foreground',
                compact ? 'size-8' : 'size-9 rounded-lg'
              )}
            >
              <Gift className={compact ? 'size-3.5' : 'size-4'} aria-hidden />
            </div>
            <div className="min-w-0">
              <h2
                className={cn(
                  'font-sans font-extrabold text-primary-foreground leading-tight',
                  compact ? 'text-xs sm:text-sm' : 'text-lg md:text-xl'
                )}
              >
                ¡Enterate de las novedades y promociones!
              </h2>
              <p
                className={cn(
                  'font-body text-primary-foreground/90 leading-snug',
                  compact
                    ? 'text-[10px] sm:text-[11px] mt-0 hidden sm:block'
                    : 'text-xs md:text-sm mt-1'
                )}
              >
                Suscribite y recibí ofertas exclusivas.
              </p>
            </div>
          </div>
          <form
            className={cn(
              'flex w-full shrink-0',
              compact
                ? 'flex-row gap-2 lg:max-w-[340px] lg:ml-auto'
                : 'flex-col sm:flex-row gap-2.5 lg:max-w-[420px]'
            )}
            onSubmit={(e) => e.preventDefault()}
          >
            <Input
              type="email"
              placeholder="Tu correo electrónico"
              className={cn(
                'rounded-full bg-white border-0 text-foreground placeholder:text-muted-foreground flex-1 min-w-0',
                compact ? 'h-8 sm:h-9 text-xs' : 'h-11 text-sm rounded-lg'
              )}
              aria-label="Correo electrónico"
            />
            <Button
              type="submit"
              className={cn(
                'bg-foreground text-background font-bold hover:bg-foreground/90 shrink-0',
                compact
                  ? 'h-8 sm:h-9 px-3 sm:px-4 text-[10px] sm:text-xs rounded-full'
                  : 'h-11 px-6 text-sm rounded-lg'
              )}
            >
              SUSCRIBIRME
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
