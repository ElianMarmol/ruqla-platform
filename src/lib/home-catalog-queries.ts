import { createPublicSupabase } from '@/lib/supabase-public';
import { isMissingSchemaError } from '@/lib/supabase-errors';
import {
  DEFAULT_HOME_CATALOG_CARDS,
  DEFAULT_HOME_CATALOG_SECTION,
} from '@/lib/home-catalog-defaults';
import type { HomeCatalogCard, HomeCatalogSection } from '@/types';

export type PublicHomeCatalog = {
  section: HomeCatalogSection;
  cards: HomeCatalogCard[];
};

export async function fetchPublicHomeCatalog(): Promise<PublicHomeCatalog> {
  try {
    const supabase = createPublicSupabase();

    const [
      { data: sectionRow, error: sectionError },
      { data: cardsRows, error: cardsError },
    ] = await Promise.all([
      supabase.from('home_catalog_section').select('*').maybeSingle(),
      supabase
        .from('home_catalog_cards')
        .select('*, categories(id, name, slug)')
        .eq('is_active', true)
        .order('order_index', { ascending: true }),
    ]);

    const section = sectionRow as HomeCatalogSection | null;
    const cards = cardsRows as HomeCatalogCard[] | null;

    if (
      isMissingSchemaError(sectionError) ||
      isMissingSchemaError(cardsError)
    ) {
      return {
        section: DEFAULT_HOME_CATALOG_SECTION,
        cards: DEFAULT_HOME_CATALOG_CARDS,
      };
    }

    if (sectionError || cardsError) {
      console.error('[home_catalog] fetch error:', sectionError ?? cardsError);
      return {
        section: DEFAULT_HOME_CATALOG_SECTION,
        cards: DEFAULT_HOME_CATALOG_CARDS,
      };
    }

    if (!section) {
      return {
        section: DEFAULT_HOME_CATALOG_SECTION,
        cards: DEFAULT_HOME_CATALOG_CARDS,
      };
    }

    if (!section.is_active) {
      return { section, cards: [] };
    }

    return {
      section,
      cards: (cards ?? []) as HomeCatalogCard[],
    };
  } catch (err) {
    console.error('[home_catalog] fetch failed:', err);
    return {
      section: DEFAULT_HOME_CATALOG_SECTION,
      cards: DEFAULT_HOME_CATALOG_CARDS,
    };
  }
}
