'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PartnerBrand } from '@/types';

import PartnerBrandFormDialog from './PartnerBrandFormDialog';
import PartnerBrandRowActions from './PartnerBrandRowActions';

type PartnerBrandsPanelProps = {
  brands: PartnerBrand[];
};

export default function PartnerBrandsPanel({ brands }: PartnerBrandsPanelProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<PartnerBrand | null>(null);

  const openCreate = () => {
    setEditingBrand(null);
    setDialogOpen(true);
  };

  const openEdit = (brand: PartnerBrand) => {
    setEditingBrand(brand);
    setDialogOpen(true);
  };

  const handleFormSuccess = (wasEdit: boolean) => {
    router.refresh();
    toast.success(
      wasEdit ? 'Marca actualizada.' : 'Marca creada correctamente.'
    );
  };

  return (
    <>
      <div className="flex flex-col gap-4 border-b border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground font-body">
          {brands.length} marca{brands.length === 1 ? '' : 's'} registrada
        </p>
        <Button type="button" onClick={openCreate} className="font-bold shrink-0">
          <Plus />
          Nueva Marca
        </Button>
      </div>

      {brands.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 px-5 py-20 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted/30">
            <Building2 className="size-8 text-muted-foreground" />
          </div>
          <div className="max-w-sm space-y-2">
            <p className="font-sans font-bold text-lg text-foreground">
              Sin marcas asociadas
            </p>
            <p className="text-sm text-muted-foreground font-body">
              Agregá logos de marcas para mostrar en la portada.
            </p>
          </div>
          <Button type="button" onClick={openCreate} className="font-bold">
            <Plus />
            Nueva Marca
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Logo</th>
                <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                <th className="px-4 py-3 text-center font-semibold">Portada</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr
                  key={brand.id}
                  className="border-t border-border/40 transition-colors hover:bg-muted/20"
                >
                  <td className="px-4 py-3">
                    <div className="h-12 w-24 rounded-lg border border-border/60 bg-muted flex items-center justify-center p-2">
                      {brand.logo_url ? (
                        <img
                          src={brand.logo_url}
                          alt={brand.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-foreground">
                    {brand.name}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant={brand.is_featured ? 'default' : 'secondary'}
                      className="text-[10px] uppercase tracking-wider"
                    >
                      {brand.is_featured ? 'Destacada' : 'Oculta'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <PartnerBrandRowActions brand={brand} onEdit={openEdit} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PartnerBrandFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        brand={editingBrand}
        onSuccess={handleFormSuccess}
      />
    </>
  );
}
