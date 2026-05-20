import type { PartnerBrand } from '@/types';

type PartnerBrandsStripProps = {
  brands: PartnerBrand[];
};

export default function PartnerBrandsStrip({ brands }: PartnerBrandsStripProps) {
  if (!brands.length) return null;

  const marqueeItems = [...brands, ...brands];

  return (
    <section className="py-12 md:py-14 bg-zinc-950 border-t border-border/60 overflow-hidden">
      <p className="text-center text-xs font-sans font-bold text-muted-foreground uppercase tracking-[0.2em] mb-8 px-4">
        Marcas que confían en nosotros
      </p>

      <div className="relative">
        <div className="flex w-max animate-partner-marquee gap-12 md:gap-16 px-6">
          {marqueeItems.map((brand, index) => (
            <div
              key={`${brand.id}-${index}`}
              className="flex shrink-0 items-center justify-center w-28 sm:w-36 h-14 sm:h-16 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            >
              <img
                src={brand.logo_url}
                alt={brand.name}
                className="max-h-full max-w-full object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
