import { createPublicSupabase } from '@/lib/supabase-public';
import { isMissingSchemaError } from '@/lib/supabase-errors';
import type { PromoBanner } from '@/types';

export async function fetchPublicPromoBanners(): Promise<PromoBanner[]> {
  try {
    const supabase = createPublicSupabase();

    const { data, error } = await supabase
      .from('promo_banners')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (isMissingSchemaError(error)) {
      return [];
    }

    if (error) {
      console.error('[promo_banners] fetch error:', error);
      return [];
    }

    return (data ?? []) as PromoBanner[];
  } catch (err) {
    console.error('[promo_banners] unexpected error:', err);
    return [];
  }
}
