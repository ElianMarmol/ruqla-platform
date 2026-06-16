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
import type { MainBanner } from '@/types';

import {
  deleteMainBannerAction,
  toggleMainBannerActiveAction,
} from '../actions';

type MainBannerRowActionsProps = {
  banner: MainBanner;
  onEdit: (banner: MainBanner) => void;
};

export default function MainBannerRowActions({
  banner,
  onEdit,
}: MainBannerRowActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(banner.is_active);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isToggling, startToggleTransition] = useTransition();

  useEffect(() => {
    setIsActive(banner.is_active);
  }, [banner.is_active]);

  const isBusy = isDeleting || isToggling;

  const handleToggleActive = () => {
    const next = !isActive;
    startToggleTransition(async () => {
      try {
        await toggleMainBannerActiveAction(banner.id, next);
        setIsActive(next);
        router.refresh();
        toast.success(
          next ? 'Banner activado en la portada.' : 'Banner desactivado.'
        );
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
        await deleteMainBannerAction(banner.id);
        setDeleteOpen(false);
        router.refresh();
        toast.success('Banner eliminado.');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'No se pudo eliminar el banner.';
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
        aria-label={isActive ? 'Desactivar banner' : 'Activar banner'}
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
        onClick={() => onEdit(banner)}
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
              aria-label="Eliminar banner"
            />
          }
        >
          <Trash2 />
          Eliminar
        </AlertDialogTrigger>

        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este banner?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borrará del carrusel Hero. Esta acción no se puede deshacer.
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
