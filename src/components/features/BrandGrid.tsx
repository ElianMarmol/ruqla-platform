import { PartnerBrand } from "@/types";

export default function BrandGrid({ brands }: { brands: PartnerBrand[] }) {
  if (!brands || brands.length === 0) return null;

  return (
    <section className="py-16 bg-background border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-sans font-bold text-muted-foreground uppercase tracking-[0.2em] mb-10">
          Marcas que confían en nosotros
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center justify-items-center opacity-80">
          {brands.map((brand) => (
            <div 
              key={brand.id} 
              className="w-full flex justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
            >
              <img 
                src={brand.logo_url} 
                alt={`Logo de ${brand.name}`} 
                className="max-h-12 md:max-h-16 object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
