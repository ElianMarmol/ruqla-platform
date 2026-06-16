'use client';

import { useTransition } from 'react';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';

import { formatPhoneDisplay } from '@/lib/phone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { StoreSettings } from '@/types';

import { updateStoreWhatsAppAction } from '../store-settings-actions';

type ContactSettingsFormProps = {
  settings: StoreSettings;
  tablesReady: boolean;
};

export default function ContactSettingsForm({
  settings,
  tablesReady,
}: ContactSettingsFormProps) {
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
        await updateStoreWhatsAppAction(formData);
        toast.success('Número de WhatsApp actualizado.');
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'No se pudo guardar el número.'
        );
      }
    });
  };

  const displayDefault = formatPhoneDisplay(settings.whatsapp_number);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 border-b border-border/60 px-5 py-5"
    >
      <div>
        <h3 className="font-sans font-bold text-foreground">WhatsApp de ventas</h3>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Usado en el botón flotante, consultas de producto y pedidos del carrito.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="whatsapp_number" className={labelClass}>
          Número (con código de país)
        </label>
        <Input
          id="whatsapp_number"
          name="whatsapp_number"
          defaultValue={displayDefault}
          placeholder="+54 9 3513 20-5892"
          required
          disabled={isPending || !tablesReady}
          className="py-5"
        />
        <p className="text-xs text-muted-foreground font-body">
          Podés escribirlo con espacios o guiones; se guarda solo en dígitos para
          wa.me.
        </p>
      </div>

      <Button type="submit" disabled={isPending || !tablesReady} className="font-bold">
        {isPending ? (
          <>
            <LoaderCircle className="animate-spin" />
            Guardando…
          </>
        ) : (
          'Guardar WhatsApp'
        )}
      </Button>
    </form>
  );
}
