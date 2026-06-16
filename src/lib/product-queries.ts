import { createPublicSupabase } from '@/lib/supabase-public';
import type { Product } from '@/types';

export type ProductWithCategory = Product & {
  categories: { id: string; name: string; slug: string } | null;
};

export async function fetchProductById(
  id: string
): Promise<ProductWithCategory | null> {
  const supabase = createPublicSupabase();

  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name, slug)')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[fetchProductById]', error);
    return null;
  }

  return data as ProductWithCategory | null;
}

export async function fetchRelatedProducts(
  categoryId: string | null,
  excludeId: string,
  limit = 4
): Promise<ProductWithCategory[]> {
  const supabase = createPublicSupabase();

  let query = supabase
    .from('products')
    .select('*, categories(id, name, slug)')
    .neq('id', excludeId)
    .gt('stock', 0)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[fetchRelatedProducts]', error);
    return [];
  }

  return (data ?? []) as ProductWithCategory[];
}
