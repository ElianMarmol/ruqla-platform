import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import ProductCard from '@/components/features/ProductCard';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

export type FeaturedProduct = Product & {
  categories?: { id: string; name: string; slug: string } | null;
};

type FeaturedProductsProps = {
  products: FeaturedProduct[];
};

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (!products.length) return null;

  return (
    <section className="py-12 md:py-16 bg-white border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 md:mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2">
              Selección curada
            </p>
            <h2 className="font-sans text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Productos Destacados
            </h2>
          </div>
          <Link
            href="/productos"
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'font-bold shrink-0 rounded-full border-foreground/15'
            )}
          >
            Ver catálogo
            <ArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
