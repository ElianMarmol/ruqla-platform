'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { LoaderCircle, UploadCloud, X } from 'lucide-react';

import { getProductCategoryIds } from '@/lib/product-category-utils';
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
import type { Category } from '@/types';

import { createProductAction, updateProductAction } from '../actions';
import type { AdminProductRow } from '../lib/queries';

const MAX_IMAGES = 8;

type ProductFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: AdminProductRow | null;
  categories: Category[];
};

type LocalPreview = {
  id: string;
  url: string;
  file?: File;
};

export default function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
}: ProductFormDialogProps) {
  const isEditing = Boolean(product);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [keptImages, setKeptImages] = useState<string[]>([]);
  const [newPreviews, setNewPreviews] = useState<LocalPreview[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const totalImages = keptImages.length + newPreviews.length;

  useEffect(() => {
    if (!open) return;

    setErrorMsg(null);
    setKeptImages(product?.images ?? []);
    setNewPreviews((prev) => {
      prev.forEach((item) => {
        if (item.file) URL.revokeObjectURL(item.url);
      });
      return [];
    });
    setSelectedCategoryIds(
      product ? getProductCategoryIds(product) : []
    );
  }, [open, product]);

  useEffect(() => {
    return () => {
      newPreviews.forEach((item) => {
        if (item.file) URL.revokeObjectURL(item.url);
      });
    };
  }, [newPreviews]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    );
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';

    if (!files.length) return;

    const availableSlots = MAX_IMAGES - keptImages.length - newPreviews.length;
    if (availableSlots <= 0) {
      setErrorMsg(`Podés subir hasta ${MAX_IMAGES} imágenes por producto.`);
      return;
    }

    const nextFiles = files.slice(0, availableSlots);
    const nextPreviews = nextFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      url: URL.createObjectURL(file),
      file,
    }));

    setNewPreviews((current) => [...current, ...nextPreviews]);
    setErrorMsg(null);
  };

  const removeKeptImage = (url: string) => {
    setKeptImages((current) => current.filter((image) => image !== url));
  };

  const removeNewPreview = (id: string) => {
    setNewPreviews((current) => {
      const target = current.find((item) => item.id === id);
      if (target?.file) URL.revokeObjectURL(target.url);
      return current.filter((item) => item.id !== id);
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    if (totalImages === 0) {
      setErrorMsg('Agregá al menos una imagen del producto.');
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set('kept_images', JSON.stringify(keptImages));

    selectedCategoryIds.forEach((categoryId) => {
      formData.append('category_ids', categoryId);
    });

    newPreviews.forEach((preview) => {
      if (preview.file) {
        formData.append('images', preview.file);
      }
    });

    if (isEditing && product) {
      formData.set('product_id', product.id);
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

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) =>
        a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
      ),
    [categories]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border/60">
        <DialogHeader className="text-left border-b border-border/60 pb-4">
          <DialogTitle className="font-sans">
            {isEditing ? 'Editar producto' : 'Nuevo producto'}
          </DialogTitle>
          <DialogDescription className="font-body">
            Varias fotos y varias categorías por producto.
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
              <span className={labelClass}>Categorías</span>
              {sortedCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground font-body">
                  Creá categorías antes de asignar productos.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl border border-border/60 bg-muted/20 p-3">
                  {sortedCategories.map((category) => {
                    const checked = selectedCategoryIds.includes(category.id);
                    return (
                      <label
                        key={category.id}
                        className={cn(
                          'flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors',
                          checked
                            ? 'border-primary/40 bg-primary/10'
                            : 'border-border/50 bg-background hover:bg-muted/40'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={isPending}
                          onChange={() => toggleCategory(category.id)}
                          className="size-4 rounded border-border accent-primary"
                        />
                        <span className="text-sm font-body text-foreground">
                          {category.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
              <p className="text-xs text-muted-foreground font-body">
                Marcá todas las secciones donde debería aparecer el producto.
              </p>
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
              <div className="flex items-center justify-between gap-2">
                <span id="images-label" className={labelClass}>
                  Imágenes del producto
                </span>
                <span className="text-xs text-muted-foreground font-body">
                  {totalImages}/{MAX_IMAGES}
                </span>
              </div>

              {(keptImages.length > 0 || newPreviews.length > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {keptImages.map((url) => (
                    <div
                      key={url}
                      className="relative overflow-hidden rounded-lg border border-border/60 bg-muted p-2"
                    >
                      <img
                        src={url}
                        alt="Imagen del producto"
                        className="h-24 w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => removeKeptImage(url)}
                        disabled={isPending}
                        className="absolute top-1 right-1 rounded-full bg-background/90 p-1 text-muted-foreground hover:text-destructive"
                        aria-label="Quitar imagen"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                  {newPreviews.map((preview) => (
                    <div
                      key={preview.id}
                      className="relative overflow-hidden rounded-lg border border-primary/30 bg-primary/5 p-2"
                    >
                      <img
                        src={preview.url}
                        alt="Nueva imagen"
                        className="h-24 w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewPreview(preview.id)}
                        disabled={isPending}
                        className="absolute top-1 right-1 rounded-full bg-background/90 p-1 text-muted-foreground hover:text-destructive"
                        aria-label="Quitar imagen nueva"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                id="images"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                disabled={isPending || totalImages >= MAX_IMAGES}
                className="hidden"
                onChange={handleImagesChange}
                aria-labelledby="images-label"
              />
              <label
                htmlFor="images"
                className={cn(
                  'flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/40 p-6 text-center transition-colors',
                  'hover:border-primary/50 hover:bg-primary/5',
                  'focus-within:border-primary focus-within:bg-primary/5 focus-within:ring-3 focus-within:ring-ring/50',
                  (isPending || totalImages >= MAX_IMAGES) &&
                    'pointer-events-none opacity-50'
                )}
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <UploadCloud className="size-7 text-primary" strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground font-body">
                    {totalImages >= MAX_IMAGES
                      ? 'Límite de imágenes alcanzado'
                      : 'Agregar imágenes'}
                  </p>
                  <p className="text-xs text-muted-foreground font-body">
                    JPG, PNG, WebP o GIF · máx. 5 MB c/u
                  </p>
                </div>
              </label>
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
