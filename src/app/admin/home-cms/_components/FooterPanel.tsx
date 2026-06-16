'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutList, LoaderCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { StoreFooter, StoreFooterLink } from '@/types';

import { updateStoreFooterSectionAction } from '../footer-actions';
import FooterLinkFormDialog from './FooterLinkFormDialog';
import FooterLinksSortableList from './FooterLinksSortableList';

type FooterPanelProps = {
  section: StoreFooter;
  links: StoreFooterLink[];
  tablesReady: boolean;
};

export default function FooterPanel({
  section,
  links,
  tablesReady,
}: FooterPanelProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<StoreFooterLink | null>(null);
  const [isPending, startTransition] = useTransition();
  const labelClass =
    'text-xs font-semibold uppercase tracking-wider text-muted-foreground';

  const handleSectionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tablesReady) {
      toast.error('Ejecutá la migración en Supabase antes de guardar.');
      return;
    }
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateStoreFooterSectionAction(formData);
        toast.success('Footer actualizado.');
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'No se pudo guardar.'
        );
      }
    });
  };

  return (
    <>
      {!tablesReady ? (
        <div className="mx-5 mt-5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm font-body text-amber-900">
          Las tablas <code>store_footer</code> y <code>store_footer_links</code>{' '}
          aún no existen. Ejecutá{' '}
          <code>supabase/migrations/20250601_store_footer.sql</code> en Supabase.
        </div>
      ) : null}

      <form
        onSubmit={handleSectionSubmit}
        className="space-y-4 border-b border-border/60 px-5 py-5"
      >
        <div>
          <h3 className="font-sans font-bold text-foreground">Pie de página</h3>
          <p className="text-sm text-muted-foreground font-body mt-1">
            Footer del sitio en páginas internas (no en la portada).
          </p>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={section.is_active}
            disabled={isPending || !tablesReady}
            className="size-4 rounded border-border accent-primary"
          />
          <span className="text-sm font-body">Mostrar footer en el sitio</span>
        </label>

        <div className="space-y-2">
          <label htmlFor="footer-copyright" className={labelClass}>
            Texto de copyright
          </label>
          <Input
            id="footer-copyright"
            name="copyright_text"
            defaultValue={section.copyright_text}
            placeholder="© {year} RUQLA. Todos los derechos reservados."
            disabled={isPending || !tablesReady}
            required
          />
          <p className="text-xs text-muted-foreground font-body">
            Usá <code>{'{year}'}</code> para el año actual.
          </p>
        </div>

        <Button type="submit" disabled={isPending || !tablesReady} className="font-bold">
          {isPending ? (
            <>
              <LoaderCircle className="animate-spin" />
              Guardando…
            </>
          ) : (
            'Guardar configuración'
          )}
        </Button>
      </form>

      <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-sans font-bold text-foreground">Enlaces</h3>
          <p className="text-sm text-muted-foreground font-body">
            {links.length} enlace{links.length === 1 ? '' : 's'} · arrastrá para ordenar
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditingLink(null);
            setDialogOpen(true);
          }}
          className="font-bold shrink-0"
          disabled={!tablesReady}
        >
          <Plus />
          Nuevo enlace
        </Button>
      </div>

      {links.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 px-5 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted/30">
            <LayoutList className="size-8 text-muted-foreground" />
          </div>
          <p className="font-body text-muted-foreground text-sm max-w-sm">
            Agregá enlaces para el pie de página.
          </p>
        </div>
      ) : (
        <FooterLinksSortableList
          links={links}
          dragEnabled={tablesReady}
          onEdit={(link) => {
            setEditingLink(link);
            setDialogOpen(true);
          }}
        />
      )}

      <FooterLinkFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        link={editingLink}
        onSuccess={(wasEdit) => {
          router.refresh();
          toast.success(wasEdit ? 'Enlace actualizado.' : 'Enlace creado.');
        }}
      />
    </>
  );
}
