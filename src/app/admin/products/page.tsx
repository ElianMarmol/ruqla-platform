import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Package } from 'lucide-react';

import ProductsAdminPanel from './_components/ProductsAdminPanel';
import { parseProductFilters, productsAdminHref } from './lib/filters';
import { fetchAllCategories, fetchPaginatedProducts } from './lib/queries';

export const metadata = {
  title: 'Admin · Productos | RUQLA',
  description: 'ABM de productos del catálogo RUQLA.',
};

export const dynamic = 'force-dynamic';

type AdminProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const resolvedParams = await searchParams;
  const filters = parseProductFilters(resolvedParams);

  let data;
  let categories;
  try {
    [data, categories] = await Promise.all([
      fetchPaginatedProducts(filters),
      fetchAllCategories(),
    ]);
  } catch (err) {
    console.error('🔥 Error fatal en products:', err);
    const message = (err as any)?.message || 'Error desconocido';
    return (
      <main className="min-h-screen bg-[#050505] text-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="font-sans text-3xl font-extrabold tracking-tight mb-4">
            Productos
          </h1>
          <p className="text-destructive font-body">
            No se pudieron cargar los productos: {message}
          </p>
        </div>
      </main>
    );
  }

  if (filters.page !== data.currentPage && data.totalCount > 0) {
    redirect(productsAdminHref({ ...filters, page: data.currentPage }));
  }

  return (
    <main className="min-h-screen bg-[#050505] text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2">
            RUQLA · Admin
          </p>
          <h1 className="font-sans text-3xl md:text-4xl font-extrabold tracking-tight">
            Gestión de Productos
          </h1>
          <p className="text-muted-foreground font-body mt-2 max-w-2xl">
            Alta, edición y baja de productos del catálogo. Las imágenes se
            almacenan en el bucket público <code className="text-foreground">products</code>.
          </p>
        </header>

        <section className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">
            <Package className="text-primary" />
            <h2 className="font-sans text-lg font-bold">Catálogo</h2>
            <span className="ml-auto text-xs text-muted-foreground font-body">
              {data.totalCount} producto{data.totalCount === 1 ? '' : 's'}
            </span>
          </div>

          <Suspense fallback={null}>
            <ProductsAdminPanel
              data={data}
              filters={filters}
              categories={categories}
            />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
