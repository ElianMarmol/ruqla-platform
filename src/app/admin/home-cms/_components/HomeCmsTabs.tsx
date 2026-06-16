'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  Category,
  HomeCatalogCard,
  HomeCatalogSection,
  MainBanner,
  PartnerBrand,
  PromoBanner,
  ShopPageHeader,
  StoreNavLink,
  StoreSettings,
  StoreTopBar,
  StoreTopBarItem,
  StoreTrustFeatures,
  StoreTrustFeaturesItem,
  StoreFooter,
  StoreFooterLink,
} from '@/types';

import CatalogSectionPanel from './CatalogSectionPanel';
import ShopHeaderSettings from './ShopHeaderSettings';
import StoreMenuPanel from './StoreMenuPanel';
import TopBarPanel from './TopBarPanel';
import TrustFeaturesPanel from './TrustFeaturesPanel';
import FooterPanel from './FooterPanel';
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
  shopPageHeader: ShopPageHeader;
  shopHeaderTableReady: boolean;
  topBarSection: StoreTopBar;
  topBarItems: StoreTopBarItem[];
  topBarTableReady: boolean;
  trustFeaturesSection: StoreTrustFeatures;
  trustFeaturesItems: StoreTrustFeaturesItem[];
  trustFeaturesTableReady: boolean;
  footerSection: StoreFooter;
  footerLinks: StoreFooterLink[];
  footerTableReady: boolean;
  storeSettings: StoreSettings;
  navLinks: StoreNavLink[];
  menuSettingsReady: boolean;
};

export default function HomeCmsTabs({
  mainBanners,
  promoBanners,
  partnerBrands,
  catalogSection,
  catalogCards,
  categories,
  catalogTablesReady,
  shopPageHeader,
  shopHeaderTableReady,
  topBarSection,
  topBarItems,
  topBarTableReady,
  trustFeaturesSection,
  trustFeaturesItems,
  trustFeaturesTableReady,
  footerSection,
  footerLinks,
  footerTableReady,
  storeSettings,
  navLinks,
  menuSettingsReady,
}: HomeCmsTabsProps) {
  return (
    <Tabs defaultValue="hero" className="w-full">
      <TabsList className="w-full sm:w-auto bg-muted/30 border border-border/60">
        <TabsTrigger value="hero">Hero Banners</TabsTrigger>
        <TabsTrigger value="promo">Promo Banners</TabsTrigger>
        <TabsTrigger value="brands">Marcas</TabsTrigger>
        <TabsTrigger value="menu">Menú y WhatsApp</TabsTrigger>
        <TabsTrigger value="topbar">Barra superior</TabsTrigger>
        <TabsTrigger value="trust">Beneficios portada</TabsTrigger>
        <TabsTrigger value="footer">Footer</TabsTrigger>
        <TabsTrigger value="catalog">Accesos catálogo</TabsTrigger>
        <TabsTrigger value="shop">Encabezado tienda</TabsTrigger>
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

      <TabsContent value="menu" className="mt-6">
        <section className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <StoreMenuPanel
            settings={storeSettings}
            navLinks={navLinks}
            categories={categories}
            tablesReady={menuSettingsReady}
          />
        </section>
      </TabsContent>

      <TabsContent value="topbar" className="mt-6">
        <section className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <TopBarPanel
            section={topBarSection}
            items={topBarItems}
            tablesReady={topBarTableReady}
          />
        </section>
      </TabsContent>

      <TabsContent value="trust" className="mt-6">
        <section className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <TrustFeaturesPanel
            section={trustFeaturesSection}
            items={trustFeaturesItems}
            tablesReady={trustFeaturesTableReady}
          />
        </section>
      </TabsContent>

      <TabsContent value="footer" className="mt-6">
        <section className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <FooterPanel
            section={footerSection}
            links={footerLinks}
            tablesReady={footerTableReady}
          />
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

      <TabsContent value="shop" className="mt-6">
        <section className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <ShopHeaderSettings
            header={shopPageHeader}
            tablesReady={shopHeaderTableReady}
          />
        </section>
      </TabsContent>
    </Tabs>
  );
}
