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
import type { MainBanner } from '@/types';

import {
  createMainBannerAction,
  updateMainBannerAction,
} from '../actions';

type MainBannerFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner: MainBanner | null;
  onSuccess?: (wasEdit: boolean) => void;
};

export default function MainBannerFormDialog({
  open,
  onOpenChange,
  banner,
  onSuccess,
}: MainBannerFormDialogProps) {
  const isEditing = Boolean(banner);
  const existingImage = banner?.image_url ?? null;
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
  }, [open, banner]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const displayPreview = previewUrl ?? (isEditing ? existingImage : null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    if (isEditing && banner) {
      formData.set('banner_id', banner.id);
      const file = formData.get('image');
      if (!(file instanceof File) || file.size === 0) {
        formData.set('keep_existing_image', 'true');
      }
    }

    startTransition(async () => {
      try {
        if (isEditing) {
          await updateMainBannerAction(formData);
        } else {
          await createMainBannerAction(formData);
        }
        onOpenChange(false);
        onSuccess?.(isEditing);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'No se pudo guardar el banner.';
        setErrorMsg(message);
        toast.error(message);
      }
    });
  };

  const labelClass =
    'text-xs font-semibold uppercase tracking-wider text-muted-foreground';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border/60">
        <DialogHeader className="text-left border-b border-border/60 pb-4">
          <DialogTitle className="font-sans">
            {isEditing ? 'Editar banner' : 'Nuevo banner'}
          </DialogTitle>
          <DialogDescription className="font-body">
            {isEditing
              ? 'Actualizá el contenido del slide del carrusel principal.'
              : 'Completá los datos para agregar un slide al Hero.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="banner-title" className={labelClass}>
                Título
              </label>
              <Input
                id="banner-title"
                name="title"
                required
                defaultValue={banner?.title ?? ''}
                disabled={isPending}
                className="py-5"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="banner-subtitle" className={labelClass}>
                Subtítulo
              </label>
              <Input
                id="banner-subtitle"
                name="subtitle"
                defaultValue={banner?.subtitle ?? ''}
                disabled={isPending}
                className="py-5"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="banner-button-text" className={labelClass}>
                Texto del botón
              </label>
              <Input
                id="banner-button-text"
                name="button_text"
                defaultValue={banner?.button_text ?? ''}
                disabled={isPending}
                className="py-5"
                placeholder="Ej. Ver ofertas"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="banner-button-link" className={labelClass}>
                Link del botón
              </label>
              <Input
                id="banner-button-link"
                name="button_link"
                type="url"
                defaultValue={banner?.button_link ?? ''}
                disabled={isPending}
                className="py-5"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <span id="banner-image-label" className={labelClass}>
                Imagen
              </span>
              <input
                id="banner-image"
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={isPending}
                className="hidden"
                onChange={handleImageChange}
                aria-labelledby="banner-image-label"
                required={!isEditing}
              />
              <label
                htmlFor="banner-image"
                className={cn(
                  'flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/40 p-6 text-center transition-colors',
                  'hover:border-primary/50 hover:bg-primary/5',
                  'focus-within:border-primary focus-within:bg-primary/5 focus-within:ring-3 focus-within:ring-ring/50',
                  isPending && 'pointer-events-none opacity-50'
                )}
              >
                {displayPreview ? (
                  <div className="relative overflow-hidden rounded-lg border border-border/60 bg-muted p-2 shadow-inner">
                    <img
                      src={displayPreview}
                      alt={fileName || banner?.title || 'Vista previa'}
                      className="h-28 w-full max-w-sm object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                    <UploadCloud className="size-8 text-primary" strokeWidth={1.5} />
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground font-body">
                    {fileName || 'Haz clic para subir imagen'}
                  </p>
                  <p className="text-xs text-muted-foreground font-body">
                    {fileName
                      ? 'Hacé clic para cambiar el archivo'
                      : 'JPG, PNG, WebP o GIF · máx. 5 MB'}
                  </p>
                </div>
              </label>
              {isEditing && existingImage && !fileName && (
                <p className="text-xs text-muted-foreground font-body">
                  Imagen actual del banner. Si no subís otra, se mantiene al
                  guardar.
                </p>
              )}
            </div>
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
                'Crear banner'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
