/**
 * Selects de Supabase con FK explícitas.
 * - products → categories: products_category_id_fkey
 * - product_categories → categories: product_categories_category_id_fkey
 */
export const PRODUCT_SELECT =
  '*, categories!products_category_id_fkey(id, name, slug), product_categories(category_id, categories!product_categories_category_id_fkey(id, name, slug))';

/** Listado general del catálogo (sin filtro de categoría). */
export const PRODUCT_SELECT_LEGACY =
  '*, categories!products_category_id_fkey(id, name, slug)';

export const PRODUCT_SELECT_BY_CATEGORY =
  '*, categories!products_category_id_fkey(id, name, slug), product_categories!inner(category_id, categories!product_categories_category_id_fkey!inner(id, name, slug))';

export const PRODUCT_SELECT_RELATED =
  '*, categories!products_category_id_fkey(id, name, slug), product_categories!inner(category_id, categories!product_categories_category_id_fkey(id, name, slug))';

export function isProductRelationshipError(error: {
  code?: string;
  message?: string;
}): boolean {
  return (
    error.code === 'PGRST200' ||
    error.code === 'PGRST201' ||
    Boolean(error.message?.includes('relationship'))
  );
}
