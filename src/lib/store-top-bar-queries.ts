import { createPublicSupabase } from '@/lib/supabase-public';
import {
  DEFAULT_STORE_TOP_BAR,
  DEFAULT_STORE_TOP_BAR_ITEMS,
} from '@/lib/store-top-bar-defaults';
import { isMissingSchemaError } from '@/lib/supabase-errors';
import type { StoreTopBar, StoreTopBarItem } from '@/types';

export type PublicStoreTopBar = {
  section: StoreTopBar;
  items: StoreTopBarItem[];
};

export async function fetchPublicStoreTopBar(): Promise<PublicStoreTopBar> {
  try {
    const supabase = createPublicSupabase();

    const [
      { data: sectionRow, error: sectionError },
      { data: itemsRows, error: itemsError },
    ] = await Promise.all([
      supabase.from('store_top_bar').select('*').maybeSingle(),
      supabase
        .from('store_top_bar_items')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true }),
    ]);

    if (isMissingSchemaError(sectionError) || isMissingSchemaError(itemsError)) {
      return {
        section: DEFAULT_STORE_TOP_BAR,
        items: DEFAULT_STORE_TOP_BAR_ITEMS,
      };
    }

    if (sectionError || itemsError) {
      console.error('[store_top_bar] fetch error:', sectionError ?? itemsError);
      return {
        section: DEFAULT_STORE_TOP_BAR,
        items: DEFAULT_STORE_TOP_BAR_ITEMS,
      };
    }

    const section = (sectionRow ?? DEFAULT_STORE_TOP_BAR) as StoreTopBar;
    const items = (itemsRows ?? DEFAULT_STORE_TOP_BAR_ITEMS) as StoreTopBarItem[];

    if (!section.is_active) {
      return { section, items: [] };
    }

    return { section, items };
  } catch (err) {
    console.error('[store_top_bar] unexpected error:', err);
    return {
      section: DEFAULT_STORE_TOP_BAR,
      items: DEFAULT_STORE_TOP_BAR_ITEMS,
    };
  }
}
