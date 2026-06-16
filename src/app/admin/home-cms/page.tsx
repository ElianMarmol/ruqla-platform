import { LayoutTemplate } from 'lucide-react';

import HomeCmsTabs from './_components/HomeCmsTabs';
import { getErrorMessage } from '@/lib/supabase-errors';

import {
  fetchAllCategoriesForCms,
  fetchHomeCatalogCards,
  fetchHomeCatalogSection,
  fetchMainBanners,
  fetchPartnerBrands,
  fetchPromoBanners,
  fetchShopPageHeader,
  fetchStoreNavLinks,
  fetchStoreSettings,
  fetchStoreTopBarItems,
  fetchStoreTopBarSection,
  fetchStoreTrustFeaturesItems,
  fetchStoreTrustFeaturesSection,
  fetchStoreFooterLinks,
  fetchStoreFooterSection,
  homeCatalogTablesExist,
  shopPageHeaderTableExists,
  storeSettingsTablesExist,
  storeTopBarTablesExist,
  storeTrustFeaturesTablesExist,
  storeFooterTablesExist,
} from './lib/queries';

export const metadata = {
  title: 'Admin · Portada | RUQLA',
  description: 'CMS de la página de inicio RUQLA.',
};

export const dynamic = 'force-dynamic';

export default async function HomeCmsPage() {
  try {
    const [
      mainBanners,
      promoBanners,
      partnerBrands,
      categories,
      catalogTablesReady,
      shopHeaderTableReady,
      shopPageHeader,
      topBarTableReady,
      topBarSection,
      trustFeaturesTableReady,
      trustFeaturesSection,
      footerTableReady,
      footerSection,
      storeSettings,
      menuSettingsReady,
    ] = await Promise.all([
      fetchMainBanners(),
      fetchPromoBanners(),
      fetchPartnerBrands(),
      fetchAllCategoriesForCms(),
      homeCatalogTablesExist(),
      shopPageHeaderTableExists(),
      fetchShopPageHeader(),
      storeTopBarTablesExist(),
      fetchStoreTopBarSection(),
      storeTrustFeaturesTablesExist(),
      fetchStoreTrustFeaturesSection(),
      storeFooterTablesExist(),
      fetchStoreFooterSection(),
      fetchStoreSettings(),
      storeSettingsTablesExist(),
    ]);

    const [catalogSection, catalogCards, topBarItems, trustFeaturesItems, footerLinks, navLinks] =
      await Promise.all([
        fetchHomeCatalogSection(),
        fetchHomeCatalogCards(),
        fetchStoreTopBarItems(),
        fetchStoreTrustFeaturesItems(),
        fetchStoreFooterLinks(),
        fetchStoreNavLinks(),
      ]);

    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <header className="mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2">
              RUQLA · Admin
            </p>
            <div className="flex items-center gap-3">
              <LayoutTemplate className="size-8 text-primary shrink-0" />
              <div>
                <h1 className="font-sans text-3xl md:text-4xl font-extrabold tracking-tight">
                  CMS Portada
                </h1>
                <p className="text-muted-foreground font-body mt-2 max-w-2xl">
                  Gestioná el carrusel Hero, banners, marcas, accesos al catálogo,
                  barra superior, beneficios de portada, footer, menú, WhatsApp y encabezado de la tienda.
                </p>
              </div>
            </div>
          </header>

          <HomeCmsTabs
            mainBanners={mainBanners}
            promoBanners={promoBanners}
            partnerBrands={partnerBrands}
            catalogSection={catalogSection}
            catalogCards={catalogCards}
            categories={categories}
            catalogTablesReady={catalogTablesReady}
            shopPageHeader={shopPageHeader}
            shopHeaderTableReady={shopHeaderTableReady}
            topBarSection={topBarSection}
            topBarItems={topBarItems}
            topBarTableReady={topBarTableReady}
            trustFeaturesSection={trustFeaturesSection}
            trustFeaturesItems={trustFeaturesItems}
            trustFeaturesTableReady={trustFeaturesTableReady}
            footerSection={footerSection}
            footerLinks={footerLinks}
            footerTableReady={footerTableReady}
            storeSettings={storeSettings}
            navLinks={navLinks}
            menuSettingsReady={menuSettingsReady}
          />
        </div>
      </main>
    );
  } catch (err) {
    console.error('🔥 Error fatal en home-cms:', err);
    const message = getErrorMessage(err);
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="font-sans text-3xl font-extrabold tracking-tight mb-4">
            CMS Portada
          </h1>
          <p className="text-destructive font-body">
            No se pudo cargar el contenido: {message}
          </p>
        </div>
      </main>
    );
  }
}
