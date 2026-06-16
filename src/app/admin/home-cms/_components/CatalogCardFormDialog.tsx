'use client';

import { useEffect, useState, useTransition } from 'react';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';

import { SETUP_ICON_OPTIONS } from '@/lib/setup-icons';
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
import type { Category, HomeCatalogCard } from '@/types';

import {
  createHomeCatalogCardAction,
  updateHomeCatalogCardAction,
} from '../catalog-section-actions';

type CatalogCardFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: HomeCatalogCard | null;
  categories: Category[];
  onSuccess?: (wasEdit: boolean) => void;
};

export default function CatalogCardFormDialog({
  open,
  onOpenChange,
  card,
  categories,
  onSuccess,
}: CatalogCardFormDialogProps) {
  const isEditing = Boolean(card);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [icon, setIcon] = useState(card?.icon ?? 'box');
  const [categoryId, setCategoryId] = useState(card?.category_id ?? '');
  const [fallbackSlug, setFallbackSlug] = useState(card?.fallback_slug ?? '');
  const [isPending, startTransition] = useTransition();
  const labelClass =
    'text-xs font-semibold uppercase tracking-wider text-muted-foreground';

  useEffect(() => {
    if (open) {
      setErrorMsg(null);
      setIcon(card?.icon ?? 'box');
      setCategoryId(card?.category_id ?? '');
      setFallbackSlug(card?.fallback_slug ?? '');
    }
  }, [open, card]);

  const handleCategoryChange = (value: string | null) => {
    if (!value) return;
    setCategoryId(value);
    const cat = categories.find((c) => c.id === value);
    if (cat) {
      setFallbackSlug(cat.slug);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);
    formData.set('icon', icon);
    formData.set('category_id', categoryId);
    formData.set('fallback_slug', fallbackSlug);

    startTransition(async () => {
      try {
        if (isEditing) {
          await updateHomeCatalogCardAction(formData);
        } else {
          await createHomeCatalogCardAction(formData);
        }
        onOpenChange(false);
        onSuccess?.(isEditing);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'No se pudo guardar la tarjeta.';
        setErrorMsg(message);
        toast.error(message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar tarjeta' : 'Nueva tarjeta de catálogo'}
          </DialogTitle>
          <DialogDescription>
            Cada tarjeta enlaza a una categoría del catálogo en la portada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isEditing ? <input type="hidden" name="card_id" value={card!.id} /> : null}

          <div className="space-y-2">
            <label htmlFor="card-title" className={labelClass}>
              Título visible
            </label>
            <Input
              id="card-title"
              name="title"
              defaultValue={card?.title ?? ''}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <span className={labelClass}>Ícono</span>
            <Select
              value={icon}
              onValueChange={(value) => value && setIcon(value)}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Elegí un ícono" />
              </SelectTrigger>
              <SelectContent>
                {SETUP_ICON_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <span className={labelClass}>Categoría</span>
            <Select
              value={categoryId || undefined}
              onValueChange={handleCategoryChange}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Elegí categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="card-fallback-slug" className={labelClass}>
              Slug de respaldo
            </label>
            <Input
              id="card-fallback-slug"
              name="fallback_slug"
              value={fallbackSlug}
              onChange={(e) => setFallbackSlug(e.target.value)}
              placeholder="ej. fundas"
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Se usa en el enlace si la categoría no está vinculada o no existe.
            </p>
          </div>

          {errorMsg ? (
            <p className="text-xs font-body font-bold text-destructive">{errorMsg}</p>
          ) : null}

          <Button type="submit" disabled={isPending} className="w-full font-bold">
            {isPending ? (
              <>
                <LoaderCircle className="animate-spin" />
                Guardando…
              </>
            ) : isEditing ? (
              'Guardar cambios'
            ) : (
              'Crear tarjeta'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
