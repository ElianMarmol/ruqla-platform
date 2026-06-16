'use client';

import { useTransition } from 'react';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ShopPageHeader } from '@/types';

import { updateShopPageHeaderAction } from '../shop-header-actions';

type ShopHeaderSettingsProps = {
  header: ShopPageHeader;
  tablesReady: boolean;
};

export default function ShopHeaderSettings({
  header,
  tablesReady,
}: ShopHeaderSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const labelClass =
    'text-xs font-semibold uppercase tracking-wider text-muted-foreground';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tablesReady) {
      toast.error('Ejecutá la migración en Supabase antes de guardar.');
      return;
    }

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await updateShopPageHeaderAction(formData);
        toast.success('Encabezado de tienda actualizado.');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'No se pudo guardar el encabezado.';
        toast.error(message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
      {!tablesReady ? (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm font-body text-amber-900 dark:text-amber-100">
          La tabla <code className="text-amber-950 dark:text-amber-50">shop_page_header</code>{' '}
          aún no existe. Ejecutá{' '}
          <code className="text-amber-950 dark:text-amber-50">
            supabase/migrations/20250528_shop_page_header.sql
          </code>{' '}
          en el SQL Editor de Supabase.
        </div>
      ) : null}

      <div>
        <h3 className="font-sans font-bold text-foreground">Encabezado de /productos</h3>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Texto superior de la tienda: etiqueta, título (con parte destacada en verde) y
          descripción.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="shop-eyebrow" className={labelClass}>
            Etiqueta superior
          </label>
          <Input
            id="shop-eyebrow"
            name="eyebrow"
            defaultValue={header.eyebrow}
            placeholder="Colección RUQLA"
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="shop-title" className={labelClass}>
            Título (parte 1)
          </label>
          <Input
            id="shop-title"
            name="title"
            defaultValue={header.title}
            placeholder="Accesorios que"
            required
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="shop-title-highlight" className={labelClass}>
            Título destacado (verde)
          </label>
          <Input
            id="shop-title-highlight"
            name="title_highlight"
            defaultValue={header.title_highlight ?? ''}
            placeholder="elevan tu día"
            disabled={isPending}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="shop-subtitle" className={labelClass}>
            Descripción
          </label>
          <Input
            id="shop-subtitle"
            name="subtitle"
            defaultValue={header.subtitle ?? ''}
            disabled={isPending}
          />
        </div>

        <div className="flex items-center gap-2 sm:col-span-2">
          <input
            type="checkbox"
            id="shop-header-active"
            name="is_active"
            defaultChecked={header.is_active}
            disabled={isPending}
            className="size-4 rounded border-border accent-primary"
          />
          <label
            htmlFor="shop-header-active"
            className="text-sm font-body text-foreground cursor-pointer"
          >
            Mostrar encabezado en la tienda
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm font-body text-muted-foreground">
        <p className="font-semibold text-foreground mb-1">Vista previa</p>
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2">
          {header.eyebrow || 'Etiqueta'}
        </p>
        <p className="font-sans text-lg font-extrabold text-foreground">
          {header.title}{' '}
          {header.title_highlight ? (
            <span className="text-primary">{header.title_highlight}</span>
          ) : null}
        </p>
        {header.subtitle ? <p className="mt-2">{header.subtitle}</p> : null}
      </div>

      <Button type="submit" disabled={isPending || !tablesReady} className="font-bold">
        {isPending ? (
          <>
            <LoaderCircle className="animate-spin" />
            Guardando…
          </>
        ) : (
          'Guardar encabezado'
        )}
      </Button>
    </form>
  );
}
