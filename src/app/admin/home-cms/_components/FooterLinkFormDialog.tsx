'use client';

import { useEffect, useState, useTransition } from 'react';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { StoreFooterLink } from '@/types';

import {
  createStoreFooterLinkAction,
  updateStoreFooterLinkAction,
} from '../footer-actions';

type FooterLinkFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: StoreFooterLink | null;
  onSuccess?: (wasEdit: boolean) => void;
};

export default function FooterLinkFormDialog({
  open,
  onOpenChange,
  link,
  onSuccess,
}: FooterLinkFormDialogProps) {
  const isEditing = Boolean(link);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const labelClass =
    'text-xs font-semibold uppercase tracking-wider text-muted-foreground';

  useEffect(() => {
    if (open) setErrorMsg(null);
  }, [open, link]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);
    if (isEditing && link) formData.set('link_id', link.id);

    startTransition(async () => {
      try {
        if (isEditing) {
          await updateStoreFooterLinkAction(formData);
        } else {
          await createStoreFooterLinkAction(formData);
        }
        onOpenChange(false);
        onSuccess?.(isEditing);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'No se pudo guardar el enlace.';
        setErrorMsg(message);
        toast.error(message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar enlace' : 'Nuevo enlace'}</DialogTitle>
          <DialogDescription>
            Texto y destino del enlace en el pie de página.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="footer-link-label" className={labelClass}>
              Texto
            </label>
            <Input
              id="footer-link-label"
              name="label"
              defaultValue={link?.label ?? ''}
              placeholder="Productos"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="footer-link-href" className={labelClass}>
              URL
            </label>
            <Input
              id="footer-link-href"
              name="href"
              defaultValue={link?.href ?? ''}
              placeholder="/productos"
              required
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground font-body">
              Ruta interna (ej. <code>/productos</code>) o URL completa.
            </p>
          </div>

          {errorMsg ? (
            <p className="text-sm font-bold text-destructive" role="alert">
              {errorMsg}
            </p>
          ) : null}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 font-bold" disabled={isPending}>
              {isPending ? (
                <>
                  <LoaderCircle className="animate-spin" />
                  Guardando…
                </>
              ) : isEditing ? (
                'Guardar'
              ) : (
                'Crear'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
