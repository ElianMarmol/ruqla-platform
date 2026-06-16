'use client';

import { useEffect, useState, useTransition } from 'react';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';

import { TOP_BAR_ICON_OPTIONS } from '@/lib/top-bar-icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { StoreTrustFeaturesItem } from '@/types';

import {
  createStoreTrustFeaturesItemAction,
  updateStoreTrustFeaturesItemAction,
} from '../trust-features-actions';

type TrustFeatureItemFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: StoreTrustFeaturesItem | null;
  onSuccess?: (wasEdit: boolean) => void;
};

export default function TrustFeatureItemFormDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: TrustFeatureItemFormDialogProps) {
  const isEditing = Boolean(item);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [icon, setIcon] = useState(item?.icon ?? 'star');
  const [isPending, startTransition] = useTransition();
  const labelClass =
    'text-xs font-semibold uppercase tracking-wider text-muted-foreground';

  useEffect(() => {
    if (open) {
      setErrorMsg(null);
      setIcon(item?.icon ?? 'star');
    }
  }, [open, item]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);
    formData.set('icon', icon);
    if (isEditing && item) {
      formData.set('item_id', item.id);
    }

    startTransition(async () => {
      try {
        if (isEditing) {
          await updateStoreTrustFeaturesItemAction(formData);
        } else {
          await createStoreTrustFeaturesItemAction(formData);
        }
        onOpenChange(false);
        onSuccess?.(isEditing);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'No se pudo guardar el ítem.';
        setErrorMsg(message);
        toast.error(message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar beneficio' : 'Nuevo beneficio'}</DialogTitle>
          <DialogDescription>
            Título, descripción e icono de la barra de beneficios en la portada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="trust-title" className={labelClass}>
              Título
            </label>
            <Input
              id="trust-title"
              name="title"
              defaultValue={item?.title ?? ''}
              placeholder="Productos Originales"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="trust-description" className={labelClass}>
              Descripción
            </label>
            <Input
              id="trust-description"
              name="description"
              defaultValue={item?.description ?? ''}
              placeholder="Marcas confiables."
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <span className={labelClass}>Icono</span>
            <Select
              value={icon}
              onValueChange={(value) => value && setIcon(value)}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Elegí un icono" />
              </SelectTrigger>
              <SelectContent>
                {TOP_BAR_ICON_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
