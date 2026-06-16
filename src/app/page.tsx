import { supabase } from '@/lib/supabase';
import HeroCarousel from '@/components/features/HeroCarousel';
import SetupCategoriesSection from '@/components/features/SetupCategoriesSection';
import TrustFeaturesBar from '@/components/features/TrustFeaturesBar';
import { fetchPublicHomeCatalog } from '@/lib/home-catalog-queries';
import { fetchPublicStoreTrustFeatures } from '@/lib/store-trust-features-queries';

export const revalidate = 60;

export default async function HomePage() {
  const [{ data: mainBanners }, homeCatalog, trustFeatures] = await Promise.all([
    supabase
      .from('main_banners')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true }),
    fetchPublicHomeCatalog(),
    fetchPublicStoreTrustFeatures(),
  ]);

  return (
    <div className="home-landing flex flex-col bg-background min-h-0 lg:min-h-[calc((100dvh-5.25rem)/1.25)] lg:max-h-[calc(100dvh-5.25rem)] lg:overflow-hidden">
      <HeroCarousel banners={mainBanners ?? []} compact />

      <SetupCategoriesSection
        section={homeCatalog.section}
        cards={homeCatalog.cards}
        compact
      />

      <TrustFeaturesBar items={trustFeatures.items} compact />
    </div>
  );
}
