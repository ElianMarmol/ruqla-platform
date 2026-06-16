'use client';

import { useTransition } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import type { StoreTopBarItem } from '@/types';

import {
  deleteStoreTopBarItemAction,
  toggleStoreTopBarItemActiveAction,
} from '../top-bar-actions';

type TopBarItemRowActionsProps = {
  item: StoreTopBarItem;
  onEdit: (item: StoreTopBarItem) => void;
};

export default function TopBarItemRowActions({
  item,
  onEdit,
}: TopBarItemRowActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleStoreTopBarItemActiveAction(item.id, !item.is_active);
        toast.success(item.is_active ? 'Ítem oculto.' : 'Ítem visible.');
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'No se pudo actualizar.'
        );
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`¿Eliminar "${item.label}"?`)) return;
    startTransition(async () => {
      try {
        await deleteStoreTopBarItemAction(item.id);
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
