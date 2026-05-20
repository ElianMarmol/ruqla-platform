import { supabase } from '@/lib/supabase';
import HeroCarousel from '@/components/features/HeroCarousel';
import FeaturedProducts from '@/components/features/FeaturedProducts';
import type { FeaturedProduct } from '@/components/features/FeaturedProducts';
import PromoGrid from '@/components/features/PromoGrid';
import PartnerBrandsStrip from '@/components/features/PartnerBrandsStrip';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowRight, Box, Monitor, Zap } from 'lucide-react';

export const revalidate = 60;

const quickCategories = [
  {
    title: 'Fundas y Protectores',
    fallbackSlug: 'fundas',
    candidateSlugs: ['fundas-y-protectores', 'fundas-protectores', 'fundas'],
    Icon: Box,
  },
  {
    title: 'Cargadores Rápidos',
    fallbackSlug: 'cargadores-cables',
    candidateSlugs: ['cargadores-cables', 'cargadores-y-cables', 'cargadores'],
    Icon: Zap,
  },
  {
    title: 'Componentes PC',
    fallbackSlug: 'componentes',
    candidateSlugs: ['componentes-pc', 'componentes'],
    Icon: Monitor,
  },
];

export default async function HomePage() {
  const [
    { data: mainBanners },
    { data: promoBanners },
    { data: partnerBrands },
    { data: featuredProducts },
    { data: categories },
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
    supabase.from('categories').select('slug').order('name', { ascending: true }),
  ]);

  const categorySlugs = (categories ?? []) as { slug: string }[];

  const getCategoryHref = (candidateSlugs: string[], fallbackSlug: string) => {
    const category = categorySlugs.find((cat) =>
      candidateSlugs.includes(cat.slug)
    );
    return `/catalog?category=${encodeURIComponent(category?.slug || fallbackSlug)}`;
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#050505]">
      <HeroCarousel banners={mainBanners ?? []} />

      <FeaturedProducts
        products={(featuredProducts ?? []) as FeaturedProduct[]}
      />

      <PromoGrid banners={promoBanners ?? []} />

      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-sans font-extrabold text-foreground tracking-tight mb-4">
              Equipá tu Setup
            </h2>
            <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
              Explorá nuestro catálogo de periféricos, componentes de alta gama y
              accesorios premium para potenciar tu experiencia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickCategories.map(({ title, fallbackSlug, candidateSlugs, Icon }) => (
              <Link
                key={title}
                href={getCategoryHref(candidateSlugs, fallbackSlug)}
                className="group block h-full"
              >
                <div className="bg-card border border-border p-8 rounded-3xl h-full flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors duration-300 hover:shadow-[0_0_30px_rgba(159,192,48,0.15)]">
                  <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-sans font-bold text-xl text-foreground mb-2">
                    {title}
                  </h3>
                  <span className="text-sm font-body text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                    Ver catálogo <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
