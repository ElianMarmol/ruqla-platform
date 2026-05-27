import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { getSetupIcon } from '@/lib/setup-icons';
import type { HomeCatalogCard, HomeCatalogSection } from '@/types';

type SetupCategoriesSectionProps = {
  section: HomeCatalogSection;
  cards: HomeCatalogCard[];
};

function getCardHref(card: HomeCatalogCard): string {
  const slug = card.categories?.slug || card.fallback_slug || '';
  return `/catalog?category=${encodeURIComponent(slug)}`;
}

export default function SetupCategoriesSection({
  section,
  cards,
}: SetupCategoriesSectionProps) {
  if (!section.is_active || cards.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-sans font-extrabold text-foreground tracking-tight mb-4">
            {section.title}
          </h2>
          {section.subtitle ? (
            <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
              {section.subtitle}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => {
            const Icon = getSetupIcon(card.icon);
            return (
              <Link
                key={card.id}
                href={getCardHref(card)}
                className="group block h-full"
              >
                <div className="bg-card border border-border p-8 rounded-3xl h-full flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors duration-300 hover:shadow-[0_0_30px_rgba(159,192,48,0.15)]">
                  <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-sans font-bold text-xl text-foreground mb-2">
                    {card.title}
                  </h3>
                  <span className="text-sm font-body text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                    Ver catálogo <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
