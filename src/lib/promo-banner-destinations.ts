import {
  PRODUCT_COLLECTIONS,
  type ProductCollectionSlug,
} from '@/lib/product-collections';

export const PROMO_DESTINATION_NONE = '__none__';

export type PromoDestinationValue =
  | typeof PROMO_DESTINATION_NONE
  | `collection:${ProductCollectionSlug}`
  | `category:${string}`;

export function promoDestinationToUrl(
  destination: string
): string | null {
  const trimmed = destination.trim();
  if (!trimmed || trimmed === PROMO_DESTINATION_NONE) return null;

  if (trimmed.startsWith('collection:')) {
    const slug = trimmed.slice('collection:'.length);
    return `/productos?collection=${encodeURIComponent(slug)}`;
  }

  if (trimmed.startsWith('category:')) {
    const slug = trimmed.slice('category:'.length);
    if (!slug) return null;
    return `/productos?category=${encodeURIComponent(slug)}`;
  }

  return null;
}

export function promoUrlToDestination(
  linkUrl: string | null | undefined
): PromoDestinationValue {
  if (!linkUrl?.trim()) return PROMO_DESTINATION_NONE;

  try {
    const url = linkUrl.startsWith('http')
      ? new URL(linkUrl)
      : new URL(linkUrl, 'http://localhost');

    const collection = url.searchParams.get('collection');
    if (collection) {
      return `collection:${collection}` as PromoDestinationValue;
    }

    const category =
      url.searchParams.get('category') || url.searchParams.get('category_id');
    if (category) {
      return `category:${category}` as PromoDestinationValue;
    }
  } catch {
    return PROMO_DESTINATION_NONE;
  }

  return PROMO_DESTINATION_NONE;
}

export function getPromoDestinationLabel(
  destination: string,
  categoryNameBySlug: Map<string, string>
): string {
  if (!destination || destination === PROMO_DESTINATION_NONE) {
    return 'Sin enlace';
  }

  if (destination.startsWith('collection:')) {
    const slug = destination.slice('collection:'.length);
    const match = Object.values(PRODUCT_COLLECTIONS).find((c) => c.slug === slug);
    return match?.label ?? slug;
  }

  if (destination.startsWith('category:')) {
    const slug = destination.slice('category:'.length);
    return categoryNameBySlug.get(slug) ?? slug;
  }

  return destination;
}
