import { NextResponse } from 'next/server';

import { isCategoryUuid, resolveCategorySlug } from '@/lib/category-resolve';
import {
  isProductCollectionSlug,
  productHasDiscount,
} from '@/lib/product-collections';
import {
  PRODUCT_SELECT_BY_CATEGORY,
  PRODUCT_SELECT_LEGACY,
  isProductRelationshipError,
} from '@/lib/product-select';
import { createPublicSupabase } from '@/lib/supabase-public';
import { isMissingSchemaError } from '@/lib/supabase-errors';

export const dynamic = 'force-dynamic';

function buildLegacyQuery(
  supabase: ReturnType<typeof createPublicSupabase>,
  options: {
    categoryParam: string | null;
    isUUID: boolean;
    include_empty_stock: boolean;
    search: string | null;
  }
) {
  let query = supabase.from('products').select(PRODUCT_SELECT_LEGACY);

  if (!options.include_empty_stock) {
    query = query.gt('stock', 0);
  }

  if (options.categoryParam) {
    if (options.isUUID) {
      query = query.eq('category_id', options.categoryParam);
    } else {
      query = query.eq('categories.slug', options.categoryParam);
    }
  }

  if (options.search) {
    query = query.ilike('name', `%${options.search}%`);
  }

  return query.order('created_at', { ascending: false }).range(0, 49);
}

export async function GET(request: Request) {
  try {
    const supabase = createPublicSupabase();
    const { searchParams } = new URL(request.url);
    let categoryParam =
      searchParams.get('category') || searchParams.get('category_id');
    const search = searchParams.get('search');
    const collection = searchParams.get('collection');
    const include_empty_stock =
      searchParams.get('include_empty_stock') !== 'false';

    if (collection && isProductCollectionSlug(collection)) {
      let query = supabase.from('products').select(PRODUCT_SELECT_LEGACY);

      if (!include_empty_stock) {
        query = query.gt('stock', 0);
      }

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      if (collection === 'mas-vendidos') {
        query = query.eq('is_featured', true);
      } else {
        query = query.not('original_price', 'is', null);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(0, 99);

      if (error) {
        console.error('[api/products] Supabase error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      const products =
        collection === 'descuentos'
          ? (data ?? []).filter(productHasDiscount)
          : (data ?? []);

      return NextResponse.json({ data: products.slice(0, 50) }, { status: 200 });
    }

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

    // Sin filtro de categoría: consulta simple (catálogo general).
    if (!categoryParam) {
      const { data, error } = await buildLegacyQuery(supabase, {
        categoryParam: null,
        isUUID: false,
        include_empty_stock,
        search,
      });

      if (error) {
        console.error('[api/products] Supabase error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ data: data ?? [] }, { status: 200 });
    }

    let query = supabase.from('products').select(PRODUCT_SELECT_BY_CATEGORY);

    if (isUUID) {
      query = query.eq('product_categories.category_id', categoryParam);
    } else {
      query = query.eq('product_categories.categories.slug', categoryParam);
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

    if (
      error &&
      (isMissingSchemaError(error) || isProductRelationshipError(error))
    ) {
      const { data: legacyProducts, error: legacyError } =
        await buildLegacyQuery(supabase, {
          categoryParam,
          isUUID,
          include_empty_stock,
          search,
        });

      if (legacyError) {
        return NextResponse.json({ error: legacyError.message }, { status: 400 });
      }

      return NextResponse.json({ data: legacyProducts ?? [] }, { status: 200 });
    }

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
