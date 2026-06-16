'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Minus, Plus, ShoppingBag } from 'lucide-react';

import { useCart } from '@/context/CartContext';
import type { ProductWithCategory } from '@/lib/product-queries';
import {
  generateProductWhatsAppLink,
  openWhatsAppLink,
} from '@/services/whatsapp';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProductCard from './ProductCard';

type ProductDetailViewProps = {
  product: ProductWithCategory;
  relatedProducts: ProductWithCategory[];
};

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

export default function ProductDetailView({
  product,
  relatedProducts,
}: ProductDetailViewProps) {
  const { addToCart } = useCart();
  const images = product.images?.length ? product.images : [];
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const isOutOfStock = product.stock === 0;
  const maxQty = Math.max(0, Number(product.stock) || 0);
  const originalPrice =
    product.original_price != null ? Number(product.original_price) : null;
  const currentPrice = Number(product.price);
  const hasDiscount =
    originalPrice != null && originalPrice > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round((1 - currentPrice / originalPrice!) * 100)
    : null;

  const specs = product.specs as Record<string, unknown> | null;
  const specEntries = specs
    ? Object.entries(specs).filter(([, v]) => v != null && String(v).trim() !== '')
    : [];

  const category = product.categories;
  const categoryHref = category
    ? `/productos?category=${encodeURIComponent(category.slug)}`
    : '/productos';

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
  };

  const handleWhatsApp = () => {
    if (isOutOfStock) return;
    const url = generateProductWhatsAppLink(product, quantity);
    openWhatsAppLink(url);
  };

  const clampQty = (next: number) =>
    Math.max(1, Math.min(next, maxQty > 0 ? maxQty : 1));

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav
            className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-body text-muted-foreground"
            aria-label="Migas de pan"
          >
            <Link href="/" className="hover:text-primary transition-colors">
              Inicio
            </Link>
            <ChevronRight className="size-3.5 shrink-0 opacity-50" aria-hidden />
            <Link
              href="/productos"
              className="hover:text-primary transition-colors"
            >
              Tienda
            </Link>
            {category ? (
              <>
                <ChevronRight
                  className="size-3.5 shrink-0 opacity-50"
                  aria-hidden
                />
                <Link
                  href={categoryHref}
                  className="hover:text-primary transition-colors"
                >
                  {category.name}
                </Link>
              </>
            ) : null}
            <ChevronRight className="size-3.5 shrink-0 opacity-50" aria-hidden />
            <span className="text-foreground font-medium line-clamp-1">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Volver a la tienda
        </Link>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20">
          {/* Galería */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted border border-border shadow-sm">
              {hasDiscount && !isOutOfStock && (
                <Badge className="absolute top-4 left-4 z-10 uppercase tracking-widest text-[10px] font-extrabold border-0 bg-primary text-primary-foreground">
                  {discountPercent != null && discountPercent > 0
                    ? `-${discountPercent}%`
                    : 'Oferta'}
                </Badge>
              )}
              {isOutOfStock && (
                <Badge
                  variant="destructive"
                  className="absolute top-4 right-4 z-10 uppercase tracking-widest text-[10px] font-extrabold"
                >
                  Agotado
                </Badge>
              )}
              {images[activeImage] ? (
                <img
                  src={images[activeImage]}
                  alt={product.name}
                  className="size-full object-contain p-8 md:p-12"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground font-body">
                  Sin imagen
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((src, index) => (
                  <button
                    key={`${src}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={cn(
                      'size-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-muted p-2 transition-all',
                      activeImage === index
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/40'
                    )}
                  >
                    <img
                      src={src}
                      alt=""
                      className="size-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {category ? (
              <Link
                href={categoryHref}
                className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-3 hover:underline w-fit"
              >
                {category.name}
              </Link>
            ) : null}

            <h1 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              {product.name}
            </h1>

            <div className="mt-6 flex flex-wrap items-end gap-3">
              {hasDiscount && (
                <span className="text-lg font-body text-muted-foreground line-through tabular-nums">
                  {currencyFormatter.format(originalPrice!)}
                </span>
              )}
              <span className="font-sans text-3xl sm:text-4xl font-extrabold text-foreground tabular-nums tracking-tight">
                {currencyFormatter.format(currentPrice)}
              </span>
            </div>

            {!isOutOfStock && maxQty <= 5 && maxQty > 0 && (
              <p className="mt-2 text-sm font-body text-amber-700">
                Últimas unidades — quedan {maxQty} en stock
              </p>
            )}

            {product.description?.trim() ? (
              <p className="mt-6 font-body text-base text-muted-foreground leading-relaxed">
                {product.description.trim()}
              </p>
            ) : (
              <p className="mt-6 font-body text-base text-muted-foreground leading-relaxed">
                Accesorio seleccionado por RUQLA para complementar tu setup con
                estilo y calidad. Consultanos por variantes o envío.
              </p>
            )}

            {!isOutOfStock && (
              <div className="mt-8 flex items-center gap-4">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Cantidad
                </span>
                <div className="flex items-center rounded-full border border-border bg-card">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => clampQty(q - 1))}
                    disabled={quantity <= 1}
                    className="flex size-10 items-center justify-center rounded-full text-muted-foreground hover:text-foreground disabled:opacity-40"
                    aria-label="Menos"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="min-w-10 text-center font-sans font-bold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => clampQty(q + 1))}
                    disabled={quantity >= maxQty}
                    className="flex size-10 items-center justify-center rounded-full text-muted-foreground hover:text-foreground disabled:opacity-40"
                    aria-label="Más"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="relative z-10 mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex-1 h-12 rounded-full font-bold text-base gap-2 hover:shadow-md"
              >
                <ShoppingBag className="size-5" />
                {isOutOfStock ? 'Sin stock' : 'Agregar al carrito'}
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                disabled={isOutOfStock}
                onClick={handleWhatsApp}
                className="flex-1 h-12 rounded-full font-bold text-base gap-2 border-foreground/15 hover:border-primary/40"
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                Consultar por WhatsApp
              </Button>
            </div>

            {specEntries.length > 0 && (
              <div className="mt-10 pt-8 border-t border-border">
                <h2 className="text-sm uppercase tracking-[0.15em] font-bold text-muted-foreground mb-4">
                  Detalles
                </h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {specEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-2xl bg-muted/50 px-4 py-3 border border-border/60"
                    >
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        {key}
                      </dt>
                      <dd className="mt-1 font-body text-sm text-foreground">
                        {String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-border">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2">
              Completá tu look
            </p>
            <h2 className="font-sans text-2xl font-extrabold text-foreground mb-8">
              También te puede gustar
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
