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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Category, StoreNavLink } from '@/types';

import {
  createStoreNavLinkAction,
  updateStoreNavLinkAction,
} from '../store-settings-actions';

type NavLinkFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: StoreNavLink | null;
  categories: Category[];
  onSuccess?: (wasEdit: boolean) => void;
};

export default function NavLinkFormDialog({
  open,
  onOpenChange,
  link,
  categories,
  onSuccess,
}: NavLinkFormDialogProps) {
  const isEditing = Boolean(link);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState(link?.category_id ?? '');
  const [fallbackSlug, setFallbackSlug] = useState(link?.fallback_slug ?? '');
  const [isPending, startTransition] = useTransition();
  const labelClass =
    'text-xs font-semibold uppercase tracking-wider text-muted-foreground';

  useEffect(() => {
    if (open) {
      setErrorMsg(null);
      setCategoryId(link?.category_id ?? '');
      setFallbackSlug(link?.fallback_slug ?? '');
    }
  }, [open, link]);

  const handleCategoryChange = (value: string | null) => {
    if (!value) return;
    setCategoryId(value);
    const cat = categories.find((c) => c.id === value);
    if (cat) setFallbackSlug(cat.slug);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);
    formData.set('category_id', categoryId);
    formData.set('fallback_slug', fallbackSlug);
    if (isEditing && link) formData.set('link_id', link.id);

    startTransition(async () => {
      try {
        if (isEditing) {
          await updateStoreNavLinkAction(formData);
        } else {
          await createStoreNavLinkAction(formData);
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
            Acceso rápido del menú (CARGADORES, FUNDAS, etc.) hacia una categoría.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="nav-label" className={labelClass}>
              Texto en el menú
            </label>
            <Input
              id="nav-label"
              name="label"
              defaultValue={link?.label ?? ''}
              placeholder="CARGADORES"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <span className={labelClass}>Categoría</span>
            <Select
              value={categoryId || undefined}
              onValueChange={handleCategoryChange}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Elegí una categoría" />
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
            <label htmlFor="nav-fallback" className={labelClass}>
              Slug de respaldo
            </label>
            <Input
              id="nav-fallback"
              name="fallback_slug"
              value={fallbackSlug}
              onChange={(e) => setFallbackSlug(e.target.value)}
              placeholder="cargadores-cables"
              disabled={isPending}
            />
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
