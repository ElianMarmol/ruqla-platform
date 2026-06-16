'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutList, LoaderCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import type { StoreTrustFeatures, StoreTrustFeaturesItem } from '@/types';

import { updateStoreTrustFeaturesSectionAction } from '../trust-features-actions';
import TrustFeatureItemFormDialog from './TrustFeatureItemFormDialog';
import TrustFeatureItemsSortableList from './TrustFeatureItemsSortableList';

type TrustFeaturesPanelProps = {
  section: StoreTrustFeatures;
  items: StoreTrustFeaturesItem[];
  tablesReady: boolean;
};

export default function TrustFeaturesPanel({
  section,
  items,
  tablesReady,
}: TrustFeaturesPanelProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StoreTrustFeaturesItem | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  const handleSectionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tablesReady) {
      toast.error('Ejecutá la migración en Supabase antes de guardar.');
      return;
    }
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateStoreTrustFeaturesSectionAction(formData);
        toast.success('Barra de beneficios actualizada.');
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'No se pudo guardar.'
        );
      }
    });
  };

  return (
    <>
      {!tablesReady ? (
        <div className="mx-5 mt-5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm font-body text-amber-900">
          Las tablas <code>store_trust_features</code> y{' '}
          <code>store_trust_features_items</code> aún no existen. Ejecutá{' '}
          <code>supabase/migrations/20250531_store_trust_features.sql</code> en
          Supabase.
        </div>
      ) : null}

      <form
        onSubmit={handleSectionSubmit}
        className="space-y-4 border-b border-border/60 px-5 py-5"
      >
        <div>
          <h3 className="font-sans font-bold text-foreground">
            Barra de beneficios
          </h3>
          <p className="text-sm text-muted-foreground font-body mt-1">
            Franja con iconos debajo del catálogo en la portada: garantía, cuotas,
            atención, etc.
          </p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={section.is_active}
            disabled={isPending || !tablesReady}
            className="size-4 rounded border-border accent-primary"
          />
          <span className="text-sm font-body">Mostrar barra en el sitio</span>
        </label>
        <Button type="submit" disabled={isPending || !tablesReady} className="font-bold">
          {isPending ? (
            <>
              <LoaderCircle className="animate-spin" />
              Guardando…
            </>
          ) : (
            'Guardar visibilidad'
          )}
        </Button>
      </form>

      <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-sans font-bold text-foreground">Ítems</h3>
          <p className="text-sm text-muted-foreground font-body">
            {items.length} ítem{items.length === 1 ? '' : 's'} · arrastrá para ordenar
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditingItem(null);
            setDialogOpen(true);
          }}
          className="font-bold shrink-0"
        >
          <Plus />
          Nuevo ítem
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 px-5 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted/30">
            <LayoutList className="size-8 text-muted-foreground" />
          </div>
          <p className="font-body text-muted-foreground text-sm max-w-sm">
            Agregá beneficios para mostrar en la portada.
          </p>
          <Button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setDialogOpen(true);
            }}
            className="font-bold"
          >
            <Plus />
            Nuevo ítem
          </Button>
        </div>
      ) : (
        <TrustFeatureItemsSortableList
          items={items}
          dragEnabled={tablesReady}
          onEdit={(item) => {
            setEditingItem(item);
            setDialogOpen(true);
          }}
        />
      )}

      <TrustFeatureItemFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        onSuccess={(wasEdit) => {
          router.refresh();
          toast.success(wasEdit ? 'Ítem actualizado.' : 'Ítem creado.');
        }}
      />
    </>
  );
}
