'use client';

import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type ProductProps = {
  product: Product & {
    categories?: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
};

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

export default function ProductCard({ product }: ProductProps) {
  const { addToCart } = useCart();
  const isOutOfStock = product.stock === 0;

  const originalPrice = product.original_price != null
    ? Number(product.original_price)
    : null;
  const currentPrice = Number(product.price);
  const hasDiscount =
    originalPrice != null && originalPrice > currentPrice;

  const discountPercent = hasDiscount
    ? Math.round((1 - currentPrice / originalPrice) * 100)
    : null;

  const specs = product.specs as Record<string, unknown>;
  const specKeys = Object.keys(specs || {}).slice(0, 2);

  return (
    <Card className="group relative h-full flex flex-col overflow-hidden bg-background border-border hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(159,192,48,0.15)] transition-all duration-300">

      {/* Badge descuento — esquina superior izquierda */}
      {hasDiscount && !isOutOfStock && (
        <Badge
          className="absolute top-3 left-3 z-10 pointer-events-none uppercase tracking-widest font-extrabold text-[10px] border-0 bg-primary text-primary-foreground shadow-[0_0_12px_rgba(159,192,48,0.55)]"
        >
          {discountPercent != null && discountPercent > 0
            ? `${discountPercent}% OFF`
            : 'Descuento'}
        </Badge>
      )}

      {isOutOfStock && (
        <Badge
          variant="destructive"
          className="absolute top-3 right-3 z-10 pointer-events-none uppercase tracking-widest font-extrabold text-[10px] shadow-md"
        >
          Agotado
        </Badge>
      )}

      {/* Imagen */}
      <div className="relative w-full aspect-square bg-[#0a0a0a] p-6 overflow-hidden flex items-center justify-center border-b border-border/50">
        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110 flex items-center justify-center p-8">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="object-contain w-full h-full drop-shadow-2xl mix-blend-screen"
              loading="lazy"
            />
          ) : (
            <div className="text-muted-foreground font-body">Sin imagen</div>
          )}
        </div>
      </div>

      <CardHeader className="p-5 pb-0 flex-1">
        <h3 className="font-sans font-bold text-lg leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {specKeys.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {specKeys.map((key) => (
              <Badge
                key={key}
                variant="secondary"
                className="text-[10px] font-body bg-secondary/50 hover:bg-secondary/80 text-secondary-foreground truncate max-w-[120px]"
              >
                {key}: {String(specs[key])}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardFooter className="p-4 pt-3 mt-auto flex flex-col gap-2.5 border-t border-border/30 bg-[#0a0a0a]/50">
        <div className="flex min-w-0 w-full flex-col">
          {hasDiscount && (
            <span className="text-[11px] sm:text-xs font-body text-muted-foreground line-through leading-none mb-0.5 tabular-nums">
              {currencyFormatter.format(originalPrice!)}
            </span>
          )}
          <span className="font-sans font-extrabold text-base sm:text-lg text-foreground leading-none tabular-nums tracking-tight">
            {currencyFormatter.format(currentPrice)}
          </span>
        </div>

        <Button
          disabled={isOutOfStock}
          onClick={() => addToCart(product)}
          size="sm"
          className={`
            w-full h-9 rounded-full font-bold text-sm transition-all duration-300 flex items-center justify-center gap-1.5 shrink-0
            ${!isOutOfStock && 'hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_15px_rgba(159,192,48,0.4)] active:scale-95'}
          `}
          variant={isOutOfStock ? 'secondary' : 'default'}
        >
          <span>Añadir</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </Button>
      </CardFooter>
    </Card>
  );
}
