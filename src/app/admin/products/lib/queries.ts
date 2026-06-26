import { supabaseService } from '@/lib/supabase-service';
import type { ProductCategoryLink } from '@/lib/product-category-utils';
import { PRODUCT_SELECT, PRODUCT_SELECT_LEGACY, isProductRelationshipError } from '@/lib/product-select';
import { isMissingSchemaError } from '@/lib/supabase-errors';
import type { Category, Product } from '@/types';

import { PRODUCTS_PAGE_SIZE } from '../constants';
import type { AdminProductFilters } from './filters';
import { getProductPaginationRange } from './filters';

export type AdminProductRow = Product & {
  categories: { id: string; name: string; slug: string } | null;
  product_categories?: ProductCategoryLink[] | null;
};

export type PaginatedProductsResult = {
  products: AdminProductRow[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

export async function fetchAllCategories(): Promise<Category[]> {
  const { data, error } = await supabaseService
    .from('categories')
    .select('id, name, slug, order_index')
    .order('order_index', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function fetchPaginatedProducts(
  filters: AdminProductFilters
): Promise<PaginatedProductsResult> {
  let countQuery = supabaseService
    .from('products')
    .select('id', { count: 'exact', head: true });

  if (filters.search) {
    countQuery = countQuery.ilike('name', `%${filters.search}%`);
  }

  const { count: filteredCount, error: countError } = await countQuery;
  if (countError) throw countError;

  const totalCount = filteredCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PRODUCTS_PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, filters.page), totalPages);
  const { from, to } = getProductPaginationRange(currentPage);

  let dataQuery = supabaseService
    .from('products')
    .select(PRODUCT_SELECT);

  if (filters.search) {
    dataQuery = dataQuery.ilike('name', `%${filters.search}%`);
  }

  const { data, error } = await dataQuery
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error && (isMissingSchemaError(error) || isProductRelationshipError(error))) {
    const { data: fallbackData, error: fallbackError } = await supabaseService
      .from('products')
      .select(PRODUCT_SELECT_LEGACY)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (fallbackError) throw fallbackError;

    return {
      products: (fallbackData ?? []) as AdminProductRow[],
      totalCount,
      totalPages,
      currentPage,
    };
  }

  if (error) throw error;

  return {
    products: (data ?? []) as AdminProductRow[],
    totalCount,
    totalPages,
    currentPage,
  };
}
