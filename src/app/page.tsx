import { supabase } from '@/lib/supabase';
import HeroCarousel from '@/components/features/HeroCarousel';
import PromoGrid from '@/components/features/PromoGrid';
import SetupCategoriesSection from '@/components/features/SetupCategoriesSection';
import TrustFeaturesBar from '@/components/features/TrustFeaturesBar';
import { fetchPublicHomeCatalog } from '@/lib/home-catalog-queries';
import { fetchPublicPromoBanners } from '@/lib/promo-banner-queries';
import { fetchPublicStoreTrustFeatures } from '@/lib/store-trust-features-queries';

export const revalidate = 60;

export default async function HomePage() {
  const [{ data: mainBanners }, homeCatalog, promoBanners, trustFeatures] =
    await Promise.all([
      supabase
        .from('main_banners')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true }),
      fetchPublicHomeCatalog(),
      fetchPublicPromoBanners(),
      fetchPublicStoreTrustFeatures(),
    ]);

  return (
    <div className="home-landing flex flex-col bg-background min-h-0">
      <HeroCarousel banners={mainBanners ?? []} compact />

      <SetupCategoriesSection
        section={homeCatalog.section}
        cards={homeCatalog.cards}
        compact
      />

      <PromoGrid banners={promoBanners} compact />

      <TrustFeaturesBar items={trustFeatures.items} compact />
    </div>
  );
}
