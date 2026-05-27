'use client';

import { useEffect, useState, useTransition } from 'react';
import { Eye, EyeOff, LoaderCircle, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { HomeCatalogCard } from '@/types';

import {
  deleteHomeCatalogCardAction,
  toggleHomeCatalogCardActiveAction,
} from '../catalog-section-actions';

type CatalogCardRowActionsProps = {
  card: HomeCatalogCard;
  onEdit: (card: HomeCatalogCard) => void;
};

export default function CatalogCardRowActions({
  card,
  onEdit,
}: CatalogCardRowActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(card.is_active);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isToggling, startToggleTransition] = useTransition();

  useEffect(() => {
    setIsActive(card.is_active);
  }, [card.is_active]);

  const isBusy = isDeleting || isToggling;

  const handleToggleActive = () => {
    const next = !isActive;
    startToggleTransition(async () => {
      try {
        await toggleHomeCatalogCardActiveAction(card.id, next);
        setIsActive(next);
        router.refresh();
        toast.success(next ? 'Tarjeta activada.' : 'Tarjeta desactivada.');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'No se pudo cambiar el estado.';
        toast.error(message);
      }
    });
  };

  const handleDelete = () => {
    setErrorMsg(null);
    startDeleteTransition(async () => {
      try {
        await deleteHomeCatalogCardAction(card.id);
        setDeleteOpen(false);
        router.refresh();
        toast.success('Tarjeta eliminada.');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'No se pudo eliminar la tarjeta.';
        toast.error(message);
        setErrorMsg(message);
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={isBusy}
        onClick={handleToggleActive}
        aria-label={isActive ? 'Desactivar' : 'Activar'}
      >
        {isToggling ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : isActive ? (
          <Eye className="size-4 text-primary" />
        ) : (
          <EyeOff className="size-4 text-muted-foreground" />
        )}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onEdit(card)}
        disabled={isBusy}
      >
        <Pencil />
        Editar
      </Button>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogTrigger
          render={
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isBusy}
              aria-label="Eliminar tarjeta"
            />
          }
        >
          <Trash2 />
          Eliminar
        </AlertDialogTrigger>

        <AlertDialogContent className="bg-zinc-950">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta tarjeta?</AlertDialogTitle>
            <AlertDialogDescription>
              Dejará de mostrarse en la portada. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {errorMsg ? (
            <p className="text-xs font-body font-bold text-destructive">{errorMsg}</p>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Volver</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <LoaderCircle className="animate-spin" />
                  Eliminando…
                </>
              ) : (
                'Sí, eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
