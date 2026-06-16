'use client';

import { useEffect, useState, useTransition } from 'react';
import { LoaderCircle, UploadCloud } from 'lucide-react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Category } from '@/types';

import {
  createProductAction,
  updateProductAction,
} from '../actions';
import type { AdminProductRow } from '../lib/queries';

type ProductFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: AdminProductRow | null;
  categories: Category[];
};

export default function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
}: ProductFormDialogProps) {
  const isEditing = Boolean(product);
  const existingImage = product?.images?.[0] ?? null;
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
  }, [open, product]);

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

    if (isEditing && product) {
      formData.set('product_id', product.id);
      const file = formData.get('image');
      if (!(file instanceof File) || file.size === 0) {
        formData.set('keep_existing_image', 'true');
      }
    }

    startTransition(async () => {
      try {
        if (isEditing) {
          await updateProductAction(formData);
        } else {
          await createProductAction(formData);
        }
        onOpenChange(false);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'No se pudo guardar el producto.';
        setErrorMsg(message);
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
            {isEditing ? 'Editar producto' : 'Nuevo producto'}
          </DialogTitle>
          <DialogDescription className="font-body">
            {isEditing
              ? 'Actualizá los datos y la imagen del catálogo.'
              : 'Completá los campos para publicar en el catálogo.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="name" className={labelClass}>
                Nombre
              </label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={product?.name ?? ''}
                disabled={isPending}
                className="py-5"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="category_id" className={labelClass}>
                Categoría
              </label>
              <Select
                key={product?.id ?? 'new'}
                name="category_id"
                defaultValue={product?.category_id ?? null}
                disabled={isPending}
                items={Object.fromEntries(
                  categories.map((c) => [c.id, c.name])
                )}
              >
                <SelectTrigger
                  id="category_id"
                  className="w-full h-10 data-[size=default]:h-10"
                >
                  <SelectValue placeholder="Sin categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Sin categoría</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="description" className={labelClass}>
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={product?.description ?? ''}
                disabled={isPending}
                className="w-full min-h-[100px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 bg-muted/40"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="original_price" className={labelClass}>
                Precio original (opc.)
              </label>
              <Input
                id="original_price"
                name="original_price"
                type="number"
                min={0}
                step="0.01"
                defaultValue={product?.original_price ?? ''}
                disabled={isPending}
                className="py-5"
                placeholder="Para mostrar descuento"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="price" className={labelClass}>
                Precio actual
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                min={0}
                step="0.01"
                required
                defaultValue={product?.price ?? ''}
                disabled={isPending}
                className="py-5"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="stock" className={labelClass}>
                Stock
              </label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min={0}
                step={1}
                required
                defaultValue={product?.stock ?? 0}
                disabled={isPending}
                className="py-5 max-w-xs"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <span id="image-label" className={labelClass}>
                Imagen del producto
              </span>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={isPending}
                className="hidden"
                onChange={handleImageChange}
                aria-labelledby="image-label"
              />
              <label
                htmlFor="image"
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
                      alt={fileName || product?.name || 'Vista previa'}
                      className="h-24 w-24 object-contain sm:h-28 sm:w-28"
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
                  Imagen actual del catálogo. Si no subís otra, se mantiene al
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
                'Crear producto'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
