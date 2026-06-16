'use client';

import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { getProductHref } from '@/lib/product-url';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
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
  const href = getProductHref(product.id);

  const originalPrice =
    product.original_price != null ? Number(product.original_price) : null;
  const currentPrice = Number(product.price);
  const hasDiscount =
    originalPrice != null && originalPrice > currentPrice;

  const discountPercent = hasDiscount
    ? Math.round((1 - currentPrice / originalPrice) * 100)
    : null;

  return (
    <Card className="group relative h-full flex flex-col overflow-hidden bg-card border-border shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20 transition-all duration-300">
      <Link
        href={href}
        className="absolute inset-0 z-0 rounded-[inherit]"
        aria-label={`Ver ${product.name}`}
      />

      {hasDiscount && !isOutOfStock && (
        <Badge className="absolute top-3 left-3 z-10 pointer-events-none uppercase tracking-widest font-extrabold text-[10px] border-0 bg-primary text-primary-foreground">
          {discountPercent != null && discountPercent > 0
            ? `${discountPercent}% OFF`
            : 'Descuento'}
        </Badge>
      )}

      {isOutOfStock && (
        <Badge
          variant="destructive"
          className="absolute top-3 right-3 z-10 pointer-events-none uppercase tracking-widest font-extrabold text-[10px]"
        >
          Agotado
        </Badge>
      )}

      <div className="relative z-[1] w-full aspect-square bg-muted p-6 overflow-hidden flex items-center justify-center border-b border-border pointer-events-none">
        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105 flex items-center justify-center p-6">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="object-contain w-full h-full"
              loading="lazy"
            />
          ) : (
            <div className="text-muted-foreground font-body text-sm">Sin imagen</div>
          )}
        </div>
      </div>

      <CardHeader className="relative z-[1] p-4 pb-0 flex-1 pointer-events-none">
        {product.categories?.name ? (
          <p className="text-[10px] uppercase tracking-[0.18em] text-primary font-bold mb-1.5">
            {product.categories.name}
          </p>
        ) : null}
        <h3 className="font-sans font-bold text-base leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>
      </CardHeader>

      <CardFooter className="relative z-[1] p-4 pt-3 mt-auto flex flex-col gap-2.5 border-t border-border bg-white">
        <div className="flex min-w-0 w-full flex-col pointer-events-none">
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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(product);
          }}
          size="sm"
          className="relative z-10 w-full h-9 rounded-full font-bold text-sm shrink-0"
          variant={isOutOfStock ? 'secondary' : 'default'}
        >
          Añadir al carrito
        </Button>
      </CardFooter>
    </Card>
  );
}
