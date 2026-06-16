import type { ShopPageHeader } from '@/types';

type ShopPageHeaderProps = {
  header: ShopPageHeader;
};

export default function ShopPageHeader({ header }: ShopPageHeaderProps) {
  if (!header.is_active) {
    return null;
  }

  return (
    <div className="w-full border-b border-border bg-gradient-to-b from-primary/5 to-background pt-12 pb-12 mb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {header.eyebrow ? (
          <p className="text-xs uppercase tracking-[0.25em] text-primary font-bold mb-3">
            {header.eyebrow}
          </p>
        ) : null}
        <h1 className="font-sans font-extrabold text-4xl sm:text-5xl mb-3 tracking-tight text-foreground">
          {header.title}
          {header.title_highlight ? (
            <>
              {' '}
              <span className="text-primary">{header.title_highlight}</span>
            </>
          ) : null}
        </h1>
        {header.subtitle ? (
          <p className="font-body text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto">
            {header.subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
