'use client';

import { useTransition } from 'react';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { HomeCatalogSection } from '@/types';

import { updateHomeCatalogSectionAction } from '../catalog-section-actions';

type CatalogSectionSettingsProps = {
  section: HomeCatalogSection;
};

export default function CatalogSectionSettings({
  section,
}: CatalogSectionSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const labelClass =
    'text-xs font-semibold uppercase tracking-wider text-muted-foreground';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await updateHomeCatalogSectionAction(formData);
        toast.success('Sección actualizada.');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'No se pudo guardar la sección.';
        toast.error(message);
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 border-b border-border/60 px-5 py-5"
    >
      <div>
        <h3 className="font-sans font-bold text-foreground">Textos de la sección</h3>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Título y descripción que aparecen sobre las tarjetas de categoría en la portada.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="catalog-section-title" className={labelClass}>
            Título
          </label>
          <Input
            id="catalog-section-title"
            name="title"
            defaultValue={section.title}
            required
            disabled={isPending}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="catalog-section-subtitle" className={labelClass}>
            Subtítulo
          </label>
          <Input
            id="catalog-section-subtitle"
            name="subtitle"
            defaultValue={section.subtitle ?? ''}
            disabled={isPending}
          />
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <input
            type="checkbox"
            id="catalog-section-active"
            name="is_active"
            defaultChecked={section.is_active}
            disabled={isPending}
            className="size-4 rounded border-border accent-primary"
          />
          <label
            htmlFor="catalog-section-active"
            className="text-sm font-body text-foreground cursor-pointer"
          >
            Mostrar sección en la portada
          </label>
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="font-bold">
        {isPending ? (
          <>
            <LoaderCircle className="animate-spin" />
            Guardando…
          </>
        ) : (
          'Guardar textos'
        )}
      </Button>
    </form>
  );
}
