import { createPublicSupabase } from '@/lib/supabase-public';
import {
  DEFAULT_STORE_TRUST_FEATURES,
  DEFAULT_STORE_TRUST_FEATURES_ITEMS,
} from '@/lib/store-trust-features-defaults';
import { isMissingSchemaError } from '@/lib/supabase-errors';
import type {
  StoreTrustFeatures,
  StoreTrustFeaturesItem,
} from '@/types';

export type PublicStoreTrustFeatures = {
  section: StoreTrustFeatures;
  items: StoreTrustFeaturesItem[];
};

export async function fetchPublicStoreTrustFeatures(): Promise<PublicStoreTrustFeatures> {
  try {
    const supabase = createPublicSupabase();

    const [
      { data: sectionRow, error: sectionError },
      { data: itemsRows, error: itemsError },
    ] = await Promise.all([
      supabase.from('store_trust_features').select('*').maybeSingle(),
      supabase
        .from('store_trust_features_items')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true }),
    ]);

    if (isMissingSchemaError(sectionError) || isMissingSchemaError(itemsError)) {
      return {
        section: DEFAULT_STORE_TRUST_FEATURES,
        items: DEFAULT_STORE_TRUST_FEATURES_ITEMS,
      };
    }

    if (sectionError || itemsError) {
      console.error(
        '[store_trust_features] fetch error:',
        sectionError ?? itemsError
      );
      return {
        section: DEFAULT_STORE_TRUST_FEATURES,
        items: DEFAULT_STORE_TRUST_FEATURES_ITEMS,
      };
    }

    const section = (sectionRow ?? DEFAULT_STORE_TRUST_FEATURES) as StoreTrustFeatures;
    const items = (itemsRows ??
      DEFAULT_STORE_TRUST_FEATURES_ITEMS) as StoreTrustFeaturesItem[];

    if (!section.is_active) {
      return { section, items: [] };
    }

    return { section, items };
  } catch (err) {
    console.error('[store_trust_features] unexpected error:', err);
    return {
      section: DEFAULT_STORE_TRUST_FEATURES,
      items: DEFAULT_STORE_TRUST_FEATURES_ITEMS,
    };
  }
}
