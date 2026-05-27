import { supabase } from '@/lib/supabase';
import HeroCarousel from '@/components/features/HeroCarousel';
import FeaturedProducts from '@/components/features/FeaturedProducts';
import type { FeaturedProduct } from '@/components/features/FeaturedProducts';
import PromoGrid from '@/components/features/PromoGrid';
import PartnerBrandsStrip from '@/components/features/PartnerBrandsStrip';
import SetupCategoriesSection from '@/components/features/SetupCategoriesSection';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchPublicHomeCatalog } from '@/lib/home-catalog-queries';
import Link from 'next/link';

export const revalidate = 60;

export default async function HomePage() {
  const [
    { data: mainBanners },
    { data: promoBanners },
    { data: partnerBrands },
    { data: featuredProducts },
    homeCatalog,
  ] = await Promise.all([
    supabase
      .from('main_banners')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true }),
    supabase
      .from('promo_banners')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true }),
    supabase
      .from('partner_brands')
      .select('*')
      .eq('is_featured', true)
      .order('name', { ascending: true }),
    supabase
      .from('products')
      .select('*, categories(id, name, slug)')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(8),
    fetchPublicHomeCatalog(),
  ]);

  return (
    <main className="flex min-h-screen flex-col bg-[#050505]">
      <HeroCarousel banners={mainBanners ?? []} />

      <FeaturedProducts
        products={(featuredProducts ?? []) as FeaturedProduct[]}
      />

      <PromoGrid banners={promoBanners ?? []} />

      <SetupCategoriesSection
        section={homeCatalog.section}
        cards={homeCatalog.cards}
      />

      <section className="relative py-16 md:py-24 border-t border-border/50 overflow-hidden bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge
            variant="outline"
            className="mb-6 border-primary text-primary bg-primary/10 px-4 py-1 text-sm tracking-widest uppercase"
          >
            Canal Mayorista
          </Badge>
          <h2 className="text-4xl md:text-5xl font-sans font-extrabold text-foreground mb-6">
            ¿Querés revender <span className="text-primary">RUQLA</span>?
          </h2>
          <p className="text-xl text-muted-foreground font-body mb-10 max-w-2xl mx-auto">
            Accedé a listas de precios preferenciales, soporte técnico dedicado y
            stock garantizado para distribuidores.
          </p>
          <Link
            href="/distribuidores"
            className={buttonVariants({
              size: 'lg',
              variant: 'default',
              className:
                'font-bold text-lg px-10 py-7 rounded-full shadow-[0_0_20px_rgba(159,192,48,0.2)] hover:shadow-[0_0_40px_rgba(159,192,48,0.5)]',
            })}
          >
            Solicitar Alta de Mayorista
          </Link>
        </div>
      </section>

      <PartnerBrandsStrip brands={partnerBrands ?? []} />
    </main>
  );
}
