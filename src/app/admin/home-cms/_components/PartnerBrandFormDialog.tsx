'use client';

import { useEffect, useState, useTransition } from 'react';
import { LoaderCircle, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { PartnerBrand } from '@/types';

import {
  createPartnerBrandAction,
  updatePartnerBrandAction,
} from '../actions';

type PartnerBrandFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: PartnerBrand | null;
  onSuccess?: (wasEdit: boolean) => void;
};

export default function PartnerBrandFormDialog({
  open,
  onOpenChange,
  brand,
  onSuccess,
}: PartnerBrandFormDialogProps) {
  const isEditing = Boolean(brand);
  const existingLogo = brand?.logo_url ?? null;
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setErrorMsg(null);
      setFileName('');
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
  }, [open, brand]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFileName('');
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }

    setFileName(file.name);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const displayPreview = previewUrl ?? (isEditing ? existingLogo : null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    if (isEditing && brand) {
      formData.set('brand_id', brand.id);
      const file = formData.get('logo');
      if (!(file instanceof File) || file.size === 0) {
        formData.set('keep_existing_image', 'true');
      }
    }

    startTransition(async () => {
      try {
        if (isEditing) {
          await updatePartnerBrandAction(formData);
        } else {
          await createPartnerBrandAction(formData);
        }
        onOpenChange(false);
        onSuccess?.(isEditing);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'No se pudo guardar la marca.';
        setErrorMsg(message);
        toast.error(message);
      }
    });
  };

  const labelClass =
    'text-xs font-semibold uppercase tracking-wider text-muted-foreground';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-zinc-950 border-border/60">
        <DialogHeader className="text-left border-b border-border/60 pb-4">
          <DialogTitle className="font-sans">
            {isEditing ? 'Editar marca' : 'Nueva marca'}
          </DialogTitle>
          <DialogDescription className="font-body">
            Marcas asociadas visibles en la sección de partners de la portada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <label htmlFor="brand-name" className={labelClass}>
              Nombre de la marca
            </label>
            <Input
              id="brand-name"
              name="name"
              required
              defaultValue={brand?.name ?? ''}
              disabled={isPending}
              className="py-5"
            />
          </div>

          <div className="space-y-2">
            <span id="brand-logo-label" className={labelClass}>
              Logo
            </span>
            <input
              id="brand-logo"
              name="logo"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              disabled={isPending}
              className="hidden"
              onChange={handleLogoChange}
              aria-labelledby="brand-logo-label"
              required={!isEditing}
            />
            <label
              htmlFor="brand-logo"
              className={cn(
                'flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/80 bg-zinc-900/50 p-6 text-center transition-colors',
                'hover:border-primary/40 hover:bg-zinc-900',
                'focus-within:border-primary focus-within:ring-3 focus-within:ring-ring/50',
                isPending && 'pointer-events-none opacity-50'
              )}
            >
              {displayPreview ? (
                <div className="relative overflow-hidden rounded-lg border border-border/60 bg-[#0a0a0a] p-3 shadow-inner">
                  <img
                    src={displayPreview}
                    alt={fileName || brand?.name || 'Logo'}
                    className="h-16 max-w-[200px] object-contain"
                  />
                </div>
              ) : (
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <UploadCloud className="size-7 text-primary" strokeWidth={1.5} />
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground font-body">
                  {fileName || 'Haz clic para subir logo'}
                </p>
                <p className="text-xs text-muted-foreground font-body">
                  PNG con fondo transparente recomendado
                </p>
              </div>
            </label>
            {isEditing && existingLogo && !fileName && (
              <p className="text-xs text-muted-foreground font-body">
                Logo actual. Si no subís otro, se mantiene al guardar.
              </p>
            )}
          </div>

          {errorMsg && (
            <p className="text-sm font-body font-bold text-destructive" role="alert">
              {errorMsg}
            </p>
          )}

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
                'Guardar cambios'
              ) : (
                'Crear marca'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
