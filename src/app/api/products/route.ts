import { NextResponse } from 'next/server';

import { isCategoryUuid, resolveCategorySlug } from '@/lib/category-resolve';
import { createPublicSupabase } from '@/lib/supabase-public';
import { isMissingSchemaError } from '@/lib/supabase-errors';

export const dynamic = 'force-dynamic';

const PRODUCT_SELECT =
  '*, categories(id, name, slug), product_categories(category_id, categories(id, name, slug))';

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

    let query = supabase.from('products').select(PRODUCT_SELECT);

    if (categoryParam) {
      query = supabase
        .from('products')
        .select(
          `${PRODUCT_SELECT}, product_categories!inner(category_id, categories!inner(id, name, slug))`
        );

      if (isUUID) {
        query = query.eq('product_categories.category_id', categoryParam);
      } else {
        query = query.eq('product_categories.categories.slug', categoryParam);
      }
    }

    if (!include_empty_stock) {
      query = query.gt('stock', 0);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data: products, error } = await query
      .order('created_at', { ascending: false })
      .range(0, 49);

    if (error) {
      if (
        isMissingSchemaError(error) &&
        categoryParam
      ) {
        let legacyQuery = supabase
          .from('products')
          .select('*, categories(id, name, slug)');

        if (!include_empty_stock) {
          legacyQuery = legacyQuery.gt('stock', 0);
        }
        if (isUUID) {
          legacyQuery = legacyQuery.eq('category_id', categoryParam);
        } else {
          legacyQuery = legacyQuery.eq('categories.slug', categoryParam);
        }
        if (search) {
          legacyQuery = legacyQuery.ilike('name', `%${search}%`);
        }

        const { data: legacyProducts, error: legacyError } = await legacyQuery
          .order('created_at', { ascending: false })
          .range(0, 49);

        if (legacyError) {
          return NextResponse.json({ error: legacyError.message }, { status: 400 });
        }

        return NextResponse.json({ data: legacyProducts ?? [] }, { status: 200 });
      }

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
