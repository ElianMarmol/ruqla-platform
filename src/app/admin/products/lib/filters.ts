import { PRODUCTS_PAGE_SIZE } from '../constants';

export type AdminProductFilters = {
  search: string | null;
  page: number;
};

function pickString(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

export function parseProductFilters(
  searchParams: Record<string, string | string[] | undefined>
): AdminProductFilters {
  const searchRaw = pickString(searchParams.q)?.trim();
  const search = searchRaw && searchRaw.length > 0 ? searchRaw : null;

  const pageRaw = parseInt(pickString(searchParams.page) ?? '1', 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  return { search, page };
}

export function buildProductSearchParams(
  filters: Partial<AdminProductFilters>
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.set('q', filters.search);
  if (filters.page && filters.page > 1) params.set('page', String(filters.page));
  return params;
}

export function productsAdminHref(filters: Partial<AdminProductFilters>): string {
  const query = buildProductSearchParams(filters).toString();
  return query ? `/admin/products?${query}` : '/admin/products';
}

export function getProductPaginationRange(page: number): { from: number; to: number } {
  const from = (page - 1) * PRODUCTS_PAGE_SIZE;
  const to = from + PRODUCTS_PAGE_SIZE - 1;
  return { from, to };
}
