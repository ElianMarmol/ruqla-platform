'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutList, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import type { Category, StoreNavLink, StoreSettings } from '@/types';

import ContactSettingsForm from './ContactSettingsForm';
import NavLinkFormDialog from './NavLinkFormDialog';
import NavLinksSortableList from './NavLinksSortableList';

type StoreMenuPanelProps = {
  settings: StoreSettings;
  navLinks: StoreNavLink[];
  categories: Category[];
  tablesReady: boolean;
};

export default function StoreMenuPanel({
  settings,
  navLinks,
  categories,
  tablesReady,
}: StoreMenuPanelProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<StoreNavLink | null>(null);

  return (
    <>
      {!tablesReady ? (
        <div className="mx-5 mt-5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm font-body text-amber-900">
          Las tablas <code>store_settings</code> y <code>store_nav_links</code> aún no
          existen. Ejecutá{' '}
          <code>supabase/migrations/20250530_store_settings_nav.sql</code> en Supabase.
        </div>
      ) : null}

      <ContactSettingsForm settings={settings} tablesReady={tablesReady} />

      <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60">
        <div>
          <h3 className="font-sans font-bold text-foreground">Enlaces del menú</h3>
          <p className="text-sm text-muted-foreground font-body">
            CARGADORES, FUNDAS, etc. — además de INICIO y PRODUCTOS fijos.
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

      {navLinks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 px-5 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted/30">
            <LayoutList className="size-8 text-muted-foreground" />
          </div>
          <p className="font-body text-muted-foreground text-sm max-w-sm">
            Agregá accesos rápidos a categorías en la barra de navegación.
          </p>
        </div>
      ) : (
        <NavLinksSortableList
          links={navLinks}
          dragEnabled={tablesReady}
          onEdit={(link) => {
            setEditingLink(link);
            setDialogOpen(true);
          }}
        />
      )}

      <NavLinkFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        link={editingLink}
        categories={categories}
        onSuccess={(wasEdit) => {
          router.refresh();
          toast.success(wasEdit ? 'Enlace actualizado.' : 'Enlace creado.');
        }}
      />
    </>
  );
}
