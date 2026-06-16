'use client';

import { useTransition } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import type { StoreTrustFeaturesItem } from '@/types';

import {
  deleteStoreTrustFeaturesItemAction,
  toggleStoreTrustFeaturesItemActiveAction,
} from '../trust-features-actions';

type TrustFeatureItemRowActionsProps = {
  item: StoreTrustFeaturesItem;
  onEdit: (item: StoreTrustFeaturesItem) => void;
};

export default function TrustFeatureItemRowActions({
  item,
  onEdit,
}: TrustFeatureItemRowActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleStoreTrustFeaturesItemActiveAction(item.id, !item.is_active);
        toast.success(item.is_active ? 'Ítem oculto.' : 'Ítem visible.');
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'No se pudo actualizar.'
        );
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`¿Eliminar "${item.title}"?`)) return;
    startTransition(async () => {
      try {
        await deleteStoreTrustFeaturesItemAction(item.id);
        toast.success('Ítem eliminado.');
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'No se pudo eliminar.'
        );
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={isPending}
        onClick={() => onEdit(item)}
        aria-label="Editar"
      >
        <Pencil />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={isPending}
        onClick={handleToggle}
      >
        {item.is_active ? 'Ocultar' : 'Mostrar'}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={isPending}
        onClick={handleDelete}
        aria-label="Eliminar"
      >
        <Trash2 />
      </Button>
    </div>
  );
}
