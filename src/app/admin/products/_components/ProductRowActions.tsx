'use client';

import { useEffect, useState, useTransition } from 'react';
import { Pencil, Star, Trash2, LoaderCircle } from 'lucide-react';
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
import { cn } from '@/lib/utils';

import { deleteProductAction, toggleProductFeaturedAction } from '../actions';
import type { AdminProductRow } from '../lib/queries';

type ProductRowActionsProps = {
  product: AdminProductRow;
  onEdit: (product: AdminProductRow) => void;
};

export default function ProductRowActions({
  product,
  onEdit,
}: ProductRowActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFeatured, setIsFeatured] = useState(Boolean(product.is_featured));
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isTogglingFeatured, startFeaturedTransition] = useTransition();

  useEffect(() => {
    setIsFeatured(Boolean(product.is_featured));
  }, [product.is_featured]);

  const isBusy = isDeleting || isTogglingFeatured;

  const handleToggleFeatured = () => {
    const next = !isFeatured;
    startFeaturedTransition(async () => {
      try {
        await toggleProductFeaturedAction(product.id, next);
        setIsFeatured(next);
        toast.success(
          next
            ? 'Producto marcado como destacado.'
            : 'Producto quitado de destacados.'
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'No se pudo actualizar el destacado.';
        toast.error(message);
      }
    });
  };

  const handleDelete = () => {
    setErrorMsg(null);
    startDeleteTransition(async () => {
      try {
        await deleteProductAction(product.id);
        setDeleteOpen(false);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'No se pudo eliminar el producto.';
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
        onClick={handleToggleFeatured}
        aria-label={
          isFeatured
            ? 'Quitar de destacados'
            : 'Marcar como destacado en portada'
        }
        className={cn(
          isFeatured && 'text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10'
        )}
      >
        {isTogglingFeatured ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Star
            className={cn(
              'size-4',
              isFeatured && 'fill-yellow-500 text-yellow-500'
            )}
          />
        )}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onEdit(product)}
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
              aria-label="Eliminar producto"
            />
          }
        >
          <Trash2 />
          Eliminar
        </AlertDialogTrigger>

        <AlertDialogContent className="bg-zinc-950">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borrará permanentemente de la base de datos. Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {errorMsg && (
            <p className="text-xs font-body font-bold text-destructive">{errorMsg}</p>
          )}

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
