import {
  DEFAULT_STORE_FOOTER,
  DEFAULT_STORE_FOOTER_LINKS,
} from '@/lib/store-footer-defaults';
import { createPublicSupabase } from '@/lib/supabase-public';
import { isMissingSchemaError } from '@/lib/supabase-errors';
import type { StoreFooter, StoreFooterLink } from '@/types';

export type PublicStoreFooter = {
  section: StoreFooter;
  links: StoreFooterLink[];
};

export async function fetchPublicStoreFooter(): Promise<PublicStoreFooter> {
  try {
    const supabase = createPublicSupabase();

    const [
      { data: sectionRow, error: sectionError },
      { data: linksRows, error: linksError },
    ] = await Promise.all([
      supabase.from('store_footer').select('*').maybeSingle(),
      supabase
        .from('store_footer_links')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true }),
    ]);

    if (isMissingSchemaError(sectionError) || isMissingSchemaError(linksError)) {
      return {
        section: DEFAULT_STORE_FOOTER,
        links: DEFAULT_STORE_FOOTER_LINKS,
      };
    }

    if (sectionError || linksError) {
      console.error('[store_footer] fetch error:', sectionError ?? linksError);
      return {
        section: DEFAULT_STORE_FOOTER,
        links: DEFAULT_STORE_FOOTER_LINKS,
      };
    }

    const section = (sectionRow ?? DEFAULT_STORE_FOOTER) as StoreFooter;
    const links = (linksRows ?? DEFAULT_STORE_FOOTER_LINKS) as StoreFooterLink[];

    if (!section.is_active) {
      return { section, links: [] };
    }

    return { section, links };
  } catch (err) {
    console.error('[store_footer] unexpected error:', err);
    return {
      section: DEFAULT_STORE_FOOTER,
      links: DEFAULT_STORE_FOOTER_LINKS,
    };
  }
}
