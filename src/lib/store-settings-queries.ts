import {
  DEFAULT_STORE_NAV_LINKS,
  DEFAULT_STORE_SETTINGS,
} from '@/lib/store-settings-defaults';
import { isMissingSchemaError } from '@/lib/supabase-errors';
import { createPublicSupabase } from '@/lib/supabase-public';
import type { StoreNavLink, StoreSettings } from '@/types';

import type { StoreNavLinkWithCategory } from './nav-link-resolve';

export async function fetchPublicStoreSettings(): Promise<StoreSettings> {
  try {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (isMissingSchemaError(error)) return DEFAULT_STORE_SETTINGS;
    if (error) {
      console.error('[store_settings] fetch error:', error);
      return DEFAULT_STORE_SETTINGS;
    }

    return (data ?? DEFAULT_STORE_SETTINGS) as StoreSettings;
  } catch (err) {
    console.error('[store_settings] unexpected error:', err);
    return DEFAULT_STORE_SETTINGS;
  }
}

export async function fetchPublicNavLinks(): Promise<StoreNavLinkWithCategory[]> {
  try {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase
      .from('store_nav_links')
      .select('*, categories(id, name, slug)')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (isMissingSchemaError(error)) {
      return DEFAULT_STORE_NAV_LINKS as StoreNavLinkWithCategory[];
    }
    if (error) {
      console.error('[store_nav_links] fetch error:', error);
      return DEFAULT_STORE_NAV_LINKS as StoreNavLinkWithCategory[];
    }

    return (data ?? DEFAULT_STORE_NAV_LINKS) as StoreNavLinkWithCategory[];
  } catch (err) {
    console.error('[store_nav_links] unexpected error:', err);
    return DEFAULT_STORE_NAV_LINKS as StoreNavLinkWithCategory[];
  }
}
