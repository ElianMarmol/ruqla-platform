import { NextResponse } from 'next/server';

import { isCategoryUuid, resolveCategorySlug } from '@/lib/category-resolve';
import { createPublicSupabase } from '@/lib/supabase-public';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = createPublicSupabase();
    const { searchParams } = new URL(request.url);
    let categoryParam =
      searchParams.get('category') || searchParams.get('category_id');
    const search = searchParams.get('search');
    const include_empty_stock =
      searchParams.get('include_empty_stock') !== 'false';

    if (categoryParam && !isCategoryUuid(categoryParam)) {
      const { data: categories } = await supabase
        .from('categories')
        .select('id, slug, name');

      categoryParam = resolveCategorySlug(
        categoryParam,
        categories ?? []
      );
    }

    const isUUID = categoryParam ? isCategoryUuid(categoryParam) : false;

    const selectQuery =
      categoryParam && !isUUID
        ? '*, categories!inner(id, name, slug)'
        : '*, categories(id, name, slug)';

    let query = supabase.from('products').select(selectQuery);

    if (!include_empty_stock) {
      query = query.gt('stock', 0);
    }

    if (categoryParam) {
      if (isUUID) {
        query = query.eq('category_id', categoryParam);
      } else {
        query = query.eq('categories.slug', categoryParam);
      }
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data: products, error } = await query
      .order('created_at', { ascending: false })
      .range(0, 49);

    if (error) {
      console.error('[api/products] Supabase error:', error);
      return NextResponse.json(
        { error: error.message, details: error.details, hint: error.hint },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: products ?? [] }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error interno del servidor';
    console.error('[api/products] Unhandled error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
