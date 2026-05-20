'use client';

import { useEffect, useState, useTransition } from 'react';
import { LoaderCircle, Pencil, Star, Trash2 } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import type { PartnerBrand } from '@/types';

import {
  deletePartnerBrandAction,
  togglePartnerBrandFeaturedAction,
} from '../actions';

type PartnerBrandRowActionsProps = {
  brand: PartnerBrand;
  onEdit: (brand: PartnerBrand) => void;
};

export default function PartnerBrandRowActions({
  brand,
  onEdit,
}: PartnerBrandRowActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFeatured, setIsFeatured] = useState(Boolean(brand.is_featured));
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isTogglingFeatured, startFeaturedTransition] = useTransition();

  useEffect(() => {
    setIsFeatured(Boolean(brand.is_featured));
  }, [brand.is_featured]);

  const isBusy = isDeleting || isTogglingFeatured;

  const handleToggleFeatured = () => {
    const next = !isFeatured;
    startFeaturedTransition(async () => {
      try {
        await togglePartnerBrandFeaturedAction(brand.id, next);
        setIsFeatured(next);
        router.refresh();
        toast.success(
          next
            ? 'Marca destacada en la portada.'
            : 'Marca quitada de destacados.'
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
        await deletePartnerBrandAction(brand.id);
        setDeleteOpen(false);
        router.refresh();
        toast.success('Marca eliminada.');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'No se pudo eliminar la marca.';
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
        onClick={handleToggleFeatured}
        aria-label={
          isFeatured ? 'Quitar de portada' : 'Mostrar en portada'
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
        onClick={() => onEdit(brand)}
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
              aria-label="Eliminar marca"
            />
          }
        >
          <Trash2 />
          Eliminar
        </AlertDialogTrigger>

        <AlertDialogContent className="bg-zinc-950">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta marca?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borrará de la lista de marcas asociadas. Esta acción no se
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
