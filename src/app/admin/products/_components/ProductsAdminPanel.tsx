'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { AdminProductFilters } from '../lib/filters';
import { productsAdminHref } from '../lib/filters';
import type { AdminProductRow, PaginatedProductsResult } from '../lib/queries';
import CategoryManagerDialog from './CategoryManagerDialog';
import ProductFormDialog from './ProductFormDialog';
import ProductRowActions from './ProductRowActions';
import ProductsPagination from './ProductsPagination';
import type { Category } from '@/types';

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

type ProductsAdminPanelProps = {
  data: PaginatedProductsResult;
  filters: AdminProductFilters;
  categories: Category[];
};

export default function ProductsAdminPanel({
  data,
  filters,
  categories,
}: ProductsAdminPanelProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProductRow | null>(
    null
  );
  const [searchInput, setSearchInput] = useState(filters.search ?? '');

  const { products, totalCount, totalPages, currentPage } = data;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    const href = productsAdminHref({
      search: q || null,
      page: 1,
    });
    router.push(href);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const openEdit = (product: AdminProductRow) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="flex flex-col gap-4 border-b border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex flex-1 max-w-md gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nombre…"
              className="pl-9 py-5"
            />
          </div>
          <Button type="submit" variant="outline">
            Buscar
          </Button>
        </form>

        <div className="flex flex-wrap gap-2 shrink-0">
          <CategoryManagerDialog categories={categories} />
          <Button type="button" onClick={openCreate} className="font-bold">
            <Plus />
            Nuevo producto
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="px-5 py-16 text-center text-muted-foreground font-body">
          {filters.search
            ? 'No hay productos que coincidan con la búsqueda.'
            : 'Aún no hay productos. Creá el primero.'}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Imagen</th>
                  <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                  <th className="px-4 py-3 text-right font-semibold">Precio</th>
                  <th className="px-4 py-3 text-right font-semibold">Stock</th>
                  <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-t border-border/40 transition-colors hover:bg-muted/20"
                  >
                    <td className="px-4 py-3">
                      <div className="h-12 w-12 rounded-lg border border-border/60 bg-muted flex items-center justify-center overflow-hidden">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-[10px] text-muted-foreground">
                            —
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-foreground">{product.name}</p>
                      {product.categories?.name && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {product.categories.name}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <span className="font-bold text-foreground">
                        {currencyFormatter.format(Number(product.price))}
                      </span>
                      {product.original_price != null &&
                        product.original_price > product.price && (
                          <p className="text-xs text-muted-foreground line-through">
                            {currencyFormatter.format(
                              Number(product.original_price)
                            )}
                          </p>
                        )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-foreground">
                      {product.stock}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ProductRowActions product={product} onEdit={openEdit} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ProductsPagination
            filters={{ ...filters, page: currentPage }}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
          />
        </>
      )}

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        categories={categories}
      />
    </>
  );
}
