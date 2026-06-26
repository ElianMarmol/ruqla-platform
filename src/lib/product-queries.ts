import { createPublicSupabase } from '@/lib/supabase-public';
import type { ProductCategoryLink } from '@/lib/product-category-utils';
import { isMissingSchemaError } from '@/lib/supabase-errors';
import type { Product } from '@/types';

export type ProductWithCategory = Product & {
  categories: { id: string; name: string; slug: string } | null;
  product_categories?: ProductCategoryLink[] | null;
};

const PRODUCT_SELECT =
  '*, categories(id, name, slug), product_categories(category_id, categories(id, name, slug))';

export async function fetchProductById(
  id: string
): Promise<ProductWithCategory | null> {
  const supabase = createPublicSupabase();

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    if (isMissingSchemaError(error)) {
      const { data: fallback } = await supabase
        .from('products')
        .select('*, categories(id, name, slug)')
        .eq('id', id)
        .maybeSingle();
      return fallback as ProductWithCategory | null;
    }
    console.error('[fetchProductById]', error);
    return null;
  }

  return data as ProductWithCategory | null;
}

export async function fetchRelatedProducts(
  categoryIds: string[],
  excludeId: string,
  limit = 4
): Promise<ProductWithCategory[]> {
  const supabase = createPublicSupabase();

  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .neq('id', excludeId)
    .gt('stock', 0)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (categoryIds.length > 0) {
    query = supabase
      .from('products')
      .select(`${PRODUCT_SELECT}, product_categories!inner(category_id)`)
      .neq('id', excludeId)
      .gt('stock', 0)
      .in('product_categories.category_id', categoryIds)
      .order('created_at', { ascending: false })
      .limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    if (isMissingSchemaError(error) && categoryIds[0]) {
      const { data: fallback } = await supabase
        .from('products')
        .select('*, categories(id, name, slug)')
        .neq('id', excludeId)
        .gt('stock', 0)
        .eq('category_id', categoryIds[0])
        .order('created_at', { ascending: false })
        .limit(limit);
      return (fallback ?? []) as ProductWithCategory[];
    }
    console.error('[fetchRelatedProducts]', error);
    return [];
  }

  return (data ?? []) as ProductWithCategory[];
}
