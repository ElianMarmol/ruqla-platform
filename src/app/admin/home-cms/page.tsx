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
  homeCatalogTablesExist,
} from './lib/queries';

export const metadata = {
  title: 'Admin · Portada | RUQLA',
  description: 'CMS de la página de inicio RUQLA.',
};

export const dynamic = 'force-dynamic';

export default async function HomeCmsPage() {
  try {
    const [mainBanners, promoBanners, partnerBrands, categories, catalogTablesReady] =
      await Promise.all([
        fetchMainBanners(),
        fetchPromoBanners(),
        fetchPartnerBrands(),
        fetchAllCategoriesForCms(),
        homeCatalogTablesExist(),
      ]);

    const [catalogSection, catalogCards] = await Promise.all([
      fetchHomeCatalogSection(),
      fetchHomeCatalogCards(),
    ]);

    return (
      <main className="min-h-screen bg-[#050505] text-foreground">
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
                  Gestioná el carrusel Hero, banners promocionales, marcas y la
                  sección de accesos al catálogo de la página de inicio.
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
          />
        </div>
      </main>
    );
  } catch (err) {
    console.error('🔥 Error fatal en home-cms:', err);
    const message = getErrorMessage(err);
    return (
      <main className="min-h-screen bg-[#050505] text-foreground">
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
