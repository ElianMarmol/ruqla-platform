export const PRODUCT_COLLECTIONS = {
  descuentos: {
    slug: 'descuentos',
    label: 'Productos con descuentos',
  },
  mas_vendidos: {
    slug: 'mas-vendidos',
    label: 'Productos más vendidos',
  },
} as const;

export type ProductCollectionSlug =
  (typeof PRODUCT_COLLECTIONS)[keyof typeof PRODUCT_COLLECTIONS]['slug'];

const COLLECTION_SLUGS = new Set<string>(
  Object.values(PRODUCT_COLLECTIONS).map((c) => c.slug)
);

export function isProductCollectionSlug(
  value: string
): value is ProductCollectionSlug {
  return COLLECTION_SLUGS.has(value);
}

export function getProductCollectionLabel(slug: string): string | null {
  const match = Object.values(PRODUCT_COLLECTIONS).find((c) => c.slug === slug);
  return match?.label ?? null;
}

export function productHasDiscount(product: {
  price: number;
  original_price?: number | null;
}): boolean {
  const original =
    product.original_price != null ? Number(product.original_price) : null;
  const price = Number(product.price);
  return original != null && original > price;
}
