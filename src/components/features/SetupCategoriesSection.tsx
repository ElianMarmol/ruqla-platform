import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { getSetupIcon } from '@/lib/setup-icons';
import { cn } from '@/lib/utils';
import type { HomeCatalogCard, HomeCatalogSection } from '@/types';

type SetupCategoriesSectionProps = {
  section: HomeCatalogSection;
  cards: HomeCatalogCard[];
  compact?: boolean;
};

function getCardHref(card: HomeCatalogCard): string {
  const slug = card.categories?.slug || card.fallback_slug || '';
  return `/productos?category=${encodeURIComponent(slug)}`;
}

export default function SetupCategoriesSection({
  section,
  cards,
  compact = false,
}: SetupCategoriesSectionProps) {
  if (!section.is_active || cards.length === 0) {
    return null;
  }

  const gridClass =
    cards.length >= 5
      ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
      : cards.length === 4
        ? 'grid-cols-2 lg:grid-cols-4'
        : 'grid-cols-2 md:grid-cols-3';

  return (
    <section
      className={cn(
        'home-categories shrink-0 bg-background',
        compact ? 'py-2 lg:py-2 lg:flex-[0.85] lg:min-h-0' : 'py-10 md:py-14'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center min-h-0">
        {!compact && (section.title || section.subtitle) ? (
          <div className="text-center mb-8 md:mb-10">
            {section.title ? (
              <h2 className="text-2xl md:text-3xl font-sans font-extrabold text-foreground tracking-tight mb-2">
                {section.title}
              </h2>
            ) : null}
            {section.subtitle ? (
              <p className="text-muted-foreground font-body text-base max-w-2xl mx-auto">
                {section.subtitle}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className={cn('grid gap-2 sm:gap-2.5', gridClass)}>
          {cards.map((card) => {
            const Icon = getSetupIcon(card.icon);
            return (
              <Link
                key={card.id}
                href={getCardHref(card)}
                className="group block h-full min-h-0"
              >
                <article className="h-full rounded-xl border border-border overflow-hidden bg-card shadow-sm transition-all hover:border-primary/30 flex flex-col">
                  <div
                    className={cn(
                      'bg-muted flex items-center justify-center flex-1 min-h-0',
                      compact ? 'p-3 lg:p-2' : 'p-8 aspect-[4/3]'
                    )}
                  >
                    <div
                      className={cn(
                        'flex items-center justify-center rounded-xl bg-white text-primary shadow-sm transition-transform group-hover:scale-105',
                        compact ? 'size-10 lg:size-11' : 'size-16 sm:size-20'
                      )}
                    >
                      <Icon
                        className={compact ? 'size-5' : 'size-8 sm:size-10'}
                        strokeWidth={1.75}
                      />
                    </div>
                  </div>
                  <div className="px-2 py-2 lg:py-1.5 text-center bg-white border-t border-border/60 shrink-0">
                    <h3 className="font-sans font-bold text-[10px] sm:text-xs uppercase tracking-wide text-foreground leading-tight">
                      {card.title}
                    </h3>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-body font-semibold text-primary">
                      Ver más
                      <ChevronRight className="size-3" />
                    </span>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
