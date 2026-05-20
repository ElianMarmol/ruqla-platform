import { supabaseService } from '@/lib/supabase-service';
import type { Category, Product } from '@/types';

import { PRODUCTS_PAGE_SIZE } from '../constants';
import type { AdminProductFilters } from './filters';
import { getProductPaginationRange } from './filters';

export type AdminProductRow = Product & {
  categories: { id: string; name: string; slug: string } | null;
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
    .select('*, categories(id, name, slug)');

  if (filters.search) {
    dataQuery = dataQuery.ilike('name', `%${filters.search}%`);
  }

  const { data, error } = await dataQuery
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    products: (data ?? []) as AdminProductRow[],
    totalCount,
    totalPages,
    currentPage,
  };
}
