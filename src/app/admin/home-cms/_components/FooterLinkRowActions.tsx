'use client';

import { useTransition } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import type { StoreFooterLink } from '@/types';

import {
  deleteStoreFooterLinkAction,
  toggleStoreFooterLinkActiveAction,
} from '../footer-actions';

type FooterLinkRowActionsProps = {
  link: StoreFooterLink;
  onEdit: (link: StoreFooterLink) => void;
};

export default function FooterLinkRowActions({
  link,
  onEdit,
}: FooterLinkRowActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleStoreFooterLinkActiveAction(link.id, !link.is_active);
        toast.success(link.is_active ? 'Enlace oculto.' : 'Enlace visible.');
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'No se pudo actualizar.'
        );
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`¿Eliminar "${link.label}"?`)) return;
    startTransition(async () => {
      try {
        await deleteStoreFooterLinkAction(link.id);
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
