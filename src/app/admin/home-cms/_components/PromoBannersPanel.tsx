'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PromoBanner } from '@/types';

import PromoBannerFormDialog from './PromoBannerFormDialog';
import PromoBannerRowActions from './PromoBannerRowActions';

const SIZE_LABELS: Record<string, string> = {
  full: 'Ancho Completo',
  half: 'Mitad de Pantalla',
};

type PromoBannersPanelProps = {
  banners: PromoBanner[];
};

export default function PromoBannersPanel({ banners }: PromoBannersPanelProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null);

  const openCreate = () => {
    setEditingBanner(null);
    setDialogOpen(true);
  };

  const openEdit = (banner: PromoBanner) => {
    setEditingBanner(banner);
    setDialogOpen(true);
  };

  const handleFormSuccess = (wasEdit: boolean) => {
    router.refresh();
    toast.success(
      wasEdit ? 'Promo banner actualizado.' : 'Promo banner creado correctamente.'
    );
  };

  return (
    <>
      <div className="flex flex-col gap-4 border-b border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground font-body">
          {banners.length} banner{banners.length === 1 ? '' : 's'} promo
        </p>
        <Button type="button" onClick={openCreate} className="font-bold shrink-0">
          <Plus />
          Nuevo Banner
        </Button>
      </div>

      {banners.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 px-5 py-20 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted/30">
            <LayoutGrid className="size-8 text-muted-foreground" />
          </div>
          <div className="max-w-sm space-y-2">
            <p className="font-sans font-bold text-lg text-foreground">
              Sin promo banners
            </p>
            <p className="text-sm text-muted-foreground font-body">
              Creá banners promocionales para la grilla de la portada.
            </p>
          </div>
          <Button type="button" onClick={openCreate} className="font-bold">
            <Plus />
            Nuevo Banner
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Imagen</th>
                <th className="px-4 py-3 text-left font-semibold">Título</th>
                <th className="px-4 py-3 text-left font-semibold">Tamaño</th>
                <th className="px-4 py-3 text-center font-semibold">Orden</th>
                <th className="px-4 py-3 text-center font-semibold">Estado</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr
                  key={banner.id}
                  className="border-t border-border/40 transition-colors hover:bg-muted/20"
                >
                  <td className="px-4 py-3">
                    <div className="h-14 w-24 rounded-lg border border-border/60 bg-muted overflow-hidden flex items-center justify-center">
                      {banner.image_url ? (
                        <img
                          src={banner.image_url}
                          alt={banner.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-foreground">{banner.title}</p>
                    {banner.subtitle && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {banner.subtitle}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {SIZE_LABELS[banner.size] ?? banner.size}
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-foreground">
                    {banner.order_index}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant={banner.is_active ? 'default' : 'secondary'}
                      className="text-[10px] uppercase tracking-wider"
                    >
                      {banner.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <PromoBannerRowActions banner={banner} onEdit={openEdit} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PromoBannerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        banner={editingBanner}
        onSuccess={handleFormSuccess}
      />
    </>
  );
}
