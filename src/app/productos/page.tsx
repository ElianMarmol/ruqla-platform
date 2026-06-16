import { Suspense } from 'react';

import CatalogView from '@/components/features/CatalogView';
import ShopPageHeader from '@/components/features/ShopPageHeader';
import { fetchPublicShopPageHeader } from '@/lib/shop-page-queries';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Tienda | RUQLA',
  description:
    'Fundas, cargadores, audio y accesorios con onda premium. Elegí tu próximo favorito.',
};

export const dynamic = 'force-dynamic';

export default async function ProductosPage() {
  const header = await fetchPublicShopPageHeader();

  return (
    <div className="min-h-screen bg-background">
      <ShopPageHeader header={header} />

      <div
        className={cn(
          'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20',
          !header.is_active && 'pt-10'
        )}
      >
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="font-sans font-bold text-muted-foreground">
                Cargando productos...
              </p>
            </div>
          }
        >
          <CatalogView />
        </Suspense>
      </div>
    </div>
  );
}
