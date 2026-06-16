import type { StoreNavLink } from '@/types';

export type StoreNavLinkWithCategory = StoreNavLink & {
  categories?: { id: string; name: string; slug: string } | null;
};

export function getNavLinkHref(link: StoreNavLinkWithCategory): string {
  const slug = link.categories?.slug || link.fallback_slug?.trim();
  if (!slug) return '/productos';
  return `/productos?category=${encodeURIComponent(slug)}`;
}

export function getNavLinkCategorySlug(link: StoreNavLinkWithCategory): string {
  return link.categories?.slug || link.fallback_slug?.trim() || '';
}
