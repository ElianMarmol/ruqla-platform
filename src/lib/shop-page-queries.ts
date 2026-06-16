import { createPublicSupabase } from '@/lib/supabase-public';
import { DEFAULT_SHOP_PAGE_HEADER } from '@/lib/shop-page-defaults';
import { isMissingSchemaError } from '@/lib/supabase-errors';
import type { ShopPageHeader } from '@/types';

export async function fetchPublicShopPageHeader(): Promise<ShopPageHeader> {
  try {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase
      .from('shop_page_header')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (isMissingSchemaError(error)) {
      return DEFAULT_SHOP_PAGE_HEADER;
    }

    if (error) {
      console.error('[shop_page_header] fetch error:', error);
      return DEFAULT_SHOP_PAGE_HEADER;
    }

    if (!data) {
      return DEFAULT_SHOP_PAGE_HEADER;
    }

    const row = data as ShopPageHeader;
    if (!row.is_active) {
      return { ...row, is_active: false };
    }

    return row;
  } catch (err) {
    console.error('[shop_page_header] unexpected error:', err);
    return DEFAULT_SHOP_PAGE_HEADER;
  }
}
