'use client';

import { useTransition } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import type { StoreNavLink } from '@/types';

import {
  deleteStoreNavLinkAction,
  toggleStoreNavLinkActiveAction,
} from '../store-settings-actions';

type NavLinkRowActionsProps = {
  link: StoreNavLink;
  onEdit: (link: StoreNavLink) => void;
};

export default function NavLinkRowActions({
  link,
  onEdit,
}: NavLinkRowActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleStoreNavLinkActiveAction(link.id, !link.is_active);
        toast.success(link.is_active ? 'Enlace oculto.' : 'Enlace visible.');
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'No se pudo actualizar.'
        );
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`¿Eliminar "${link.label}" del menú?`)) return;
    startTransition(async () => {
      try {
        await deleteStoreNavLinkAction(link.id);
        toast.success('Enlace eliminado.');
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
        onClick={() => onEdit(link)}
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
        {link.is_active ? 'Ocultar' : 'Mostrar'}
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
