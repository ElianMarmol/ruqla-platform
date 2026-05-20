'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { MainBanner, PartnerBrand, PromoBanner } from '@/types';

import HeroBannersPanel from './HeroBannersPanel';
import PartnerBrandsPanel from './PartnerBrandsPanel';
import PromoBannersPanel from './PromoBannersPanel';

type HomeCmsTabsProps = {
  mainBanners: MainBanner[];
  promoBanners: PromoBanner[];
  partnerBrands: PartnerBrand[];
};

export default function HomeCmsTabs({
  mainBanners,
  promoBanners,
  partnerBrands,
}: HomeCmsTabsProps) {
  return (
    <Tabs defaultValue="hero" className="w-full">
      <TabsList className="w-full sm:w-auto bg-muted/30 border border-border/60">
        <TabsTrigger value="hero">Hero Banners</TabsTrigger>
        <TabsTrigger value="promo">Promo Banners</TabsTrigger>
        <TabsTrigger value="brands">Marcas</TabsTrigger>
      </TabsList>

      <TabsContent value="hero" className="mt-6">
        <section className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <HeroBannersPanel banners={mainBanners} />
        </section>
      </TabsContent>

      <TabsContent value="promo" className="mt-6">
        <section className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <PromoBannersPanel banners={promoBanners} />
        </section>
      </TabsContent>

      <TabsContent value="brands" className="mt-6">
        <section className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <PartnerBrandsPanel brands={partnerBrands} />
        </section>
      </TabsContent>
    </Tabs>
  );
}
