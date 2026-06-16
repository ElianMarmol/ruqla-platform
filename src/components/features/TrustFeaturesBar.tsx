import { CreditCard, MessageCircle, Shield, Star } from 'lucide-react';

import { cn } from '@/lib/utils';

const FEATURES = [
  {
    icon: Star,
    title: 'Productos Originales',
    description: 'Marcas confiables.',
  },
  {
    icon: Shield,
    title: 'Garantía',
    description: 'Con garantía oficial.',
  },
  {
    icon: MessageCircle,
    title: 'Atención Personalizada',
    description: 'Por WhatsApp.',
  },
  {
    icon: CreditCard,
    title: 'Hasta 6 cuotas',
    description: 'Mercado Pago.',
  },
] as const;

type TrustFeaturesBarProps = {
  compact?: boolean;
};

export default function TrustFeaturesBar({ compact }: TrustFeaturesBarProps) {
  return (
    <section
      className={cn(
        'home-trust shrink-0 border-y border-border bg-white',
        compact ? 'py-3 lg:py-2.5 lg:flex-[0.55] lg:min-h-0' : 'py-8 md:py-10'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div
          className={cn(
            'grid w-full',
            compact
              ? 'grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4'
              : 'grid-cols-2 md:grid-cols-4 gap-6 md:gap-8'
          )}
        >
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className={cn(
                'flex items-center text-center lg:text-left',
                compact
                  ? 'flex-col lg:flex-row gap-1.5 lg:gap-2 justify-center lg:justify-start'
                  : 'flex-col gap-2.5 px-2'
              )}
            >
              <div
                className={cn(
                  'flex shrink-0 items-center justify-center rounded-full border-2 border-primary/30 text-primary',
                  compact ? 'size-8' : 'size-11'
                )}
              >
                <Icon
                  className={compact ? 'size-3.5' : 'size-5'}
                  strokeWidth={2}
                  aria-hidden
                />
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    'font-sans font-bold text-foreground leading-tight',
                    compact ? 'text-[11px]' : 'text-sm'
                  )}
                >
                  {title}
                </p>
                <p
                  className={cn(
                    'text-muted-foreground font-body leading-tight',
                    compact ? 'text-[9px] hidden sm:block' : 'text-xs'
                  )}
                >
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
