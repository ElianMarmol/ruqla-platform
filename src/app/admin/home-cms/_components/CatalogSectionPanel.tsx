'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import type { Category, HomeCatalogCard, HomeCatalogSection } from '@/types';

import CatalogCardFormDialog from './CatalogCardFormDialog';
import CatalogCardsSortableList from './CatalogCardsSortableList';
import CatalogSectionSettings from './CatalogSectionSettings';

type CatalogSectionPanelProps = {
  section: HomeCatalogSection;
  cards: HomeCatalogCard[];
  categories: Category[];
  tablesReady: boolean;
};

export default function CatalogSectionPanel({
  section,
  cards,
  categories,
  tablesReady,
}: CatalogSectionPanelProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<HomeCatalogCard | null>(null);

  const openCreate = () => {
    setEditingCard(null);
    setDialogOpen(true);
  };

  const openEdit = (card: HomeCatalogCard) => {
    setEditingCard(card);
    setDialogOpen(true);
  };

  const handleFormSuccess = (wasEdit: boolean) => {
    router.refresh();
    toast.success(wasEdit ? 'Tarjeta actualizada.' : 'Tarjeta creada correctamente.');
  };

  return (
    <>
      {!tablesReady ? (
        <div className="mx-5 mt-5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm font-body text-amber-200">
          Las tablas <code className="text-amber-100">home_catalog_section</code> y{' '}
          <code className="text-amber-100">home_catalog_cards</code> aún no existen en
          Supabase. Ejecutá la migración{' '}
          <code className="text-amber-100">
            supabase/migrations/20250527_home_catalog_section.sql
          </code>{' '}
          en el SQL Editor para poder guardar cambios.
        </div>
      ) : null}

      <CatalogSectionSettings section={section} />

      <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-sans font-bold text-foreground">Tarjetas de categoría</h3>
          <p className="text-sm text-muted-foreground font-body">
            {cards.length} tarjeta{cards.length === 1 ? '' : 's'} · accesos rápidos al catálogo
          </p>
        </div>
        <Button type="button" onClick={openCreate} className="font-bold shrink-0">
          <Plus />
          Nueva tarjeta
        </Button>
      </div>

      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 px-5 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted/30">
            <LayoutGrid className="size-8 text-muted-foreground" />
          </div>
          <div className="max-w-sm space-y-2">
            <p className="font-sans font-bold text-lg text-foreground">Sin tarjetas</p>
            <p className="text-sm text-muted-foreground font-body">
              Agregá tarjetas para la sección &quot;Equipá tu Setup&quot; en la portada.
            </p>
          </div>
          <Button type="button" onClick={openCreate} className="font-bold">
            <Plus />
            Nueva tarjeta
          </Button>
        </div>
      ) : (
        <CatalogCardsSortableList
          cards={cards}
          dragEnabled={tablesReady}
          onEdit={openEdit}
        />
      )}

      <CatalogCardFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        card={editingCard}
        categories={categories}
        onSuccess={handleFormSuccess}
      />
    </>
  );
}
