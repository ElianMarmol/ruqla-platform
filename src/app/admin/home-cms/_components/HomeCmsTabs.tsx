'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  Category,
  HomeCatalogCard,
  HomeCatalogSection,
  MainBanner,
  PartnerBrand,
  PromoBanner,
} from '@/types';

import CatalogSectionPanel from './CatalogSectionPanel';
import HeroBannersPanel from './HeroBannersPanel';
import PartnerBrandsPanel from './PartnerBrandsPanel';
import PromoBannersPanel from './PromoBannersPanel';

type HomeCmsTabsProps = {
  mainBanners: MainBanner[];
  promoBanners: PromoBanner[];
  partnerBrands: PartnerBrand[];
  catalogSection: HomeCatalogSection;
  catalogCards: HomeCatalogCard[];
  categories: Category[];
  catalogTablesReady: boolean;
};

export default function HomeCmsTabs({
  mainBanners,
  promoBanners,
  partnerBrands,
  catalogSection,
  catalogCards,
  categories,
  catalogTablesReady,
}: HomeCmsTabsProps) {
  return (
    <Tabs defaultValue="hero" className="w-full">
      <TabsList className="w-full sm:w-auto bg-muted/30 border border-border/60">
        <TabsTrigger value="hero">Hero Banners</TabsTrigger>
        <TabsTrigger value="promo">Promo Banners</TabsTrigger>
        <TabsTrigger value="brands">Marcas</TabsTrigger>
        <TabsTrigger value="catalog">Accesos catálogo</TabsTrigger>
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

      <TabsContent value="catalog" className="mt-6">
        <section className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <CatalogSectionPanel
            section={catalogSection}
            cards={catalogCards}
            categories={categories}
            tablesReady={catalogTablesReady}
          />
        </section>
      </TabsContent>
    </Tabs>
  );
}
