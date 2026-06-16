'use client';

import { useState, useTransition } from 'react';
import { Ban, CircleCheck, Eye, LoaderCircle } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Order } from '@/types';

import { updateOrderStatusAction } from '../actions';

type OrderItem = {
  product?: {
    id?: string;
    name?: string;
    price?: number | string;
    images?: string[];
  };
  quantity?: number;
};

type PendingAction = 'complete' | 'cancel' | null;

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

function parseItems(rawItems: Order['items']): OrderItem[] {
  if (Array.isArray(rawItems)) {
    return rawItems as OrderItem[];
  }
  if (typeof rawItems === 'string') {
    try {
      const parsed = JSON.parse(rawItems);
      return Array.isArray(parsed) ? (parsed as OrderItem[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default function OrderRowActions({ order }: { order: Order }) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [, startTransition] = useTransition();

  const items = parseItems(order.items);
  const isPendingOrder = order.status === 'pending';
  const isCancelling = pendingAction === 'cancel';
  const isCompleting = pendingAction === 'complete';

  const runStatusUpdate = (
    status: 'completed' | 'cancelled',
    action: PendingAction,
    onSuccess?: () => void
  ) => {
    setErrorMsg(null);
    setPendingAction(action);
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set('orderId', order.id);
        fd.set('status', status);
        await updateOrderStatusAction(fd);
        onSuccess?.();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'No se pudo actualizar el pedido.';
        setErrorMsg(message);
      } finally {
        setPendingAction(null);
      }
    });
  };

  const handleComplete = () => runStatusUpdate('completed', 'complete');

  const handleConfirmCancel = () => {
    runStatusUpdate('cancelled', 'cancel', () => setCancelOpen(false));
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setDetailOpen(true)}
        disabled={isCancelling || isCompleting}
      >
        <Eye />
        Detalle
      </Button>

      {isPendingOrder && (
        <>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleComplete}
            disabled={isCompleting || isCancelling}
            aria-label="Marcar como completada"
          >
            {isCompleting ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <CircleCheck />
            )}
            {isCompleting ? 'Procesando…' : 'Completar'}
          </Button>

          <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
            <AlertDialogTrigger
              render={
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isCancelling || isCompleting}
                  aria-label="Marcar como cancelada"
                />
              }
            >
              <Ban />
              Cancelar
            </AlertDialogTrigger>

            <AlertDialogContent className="bg-card">
              <AlertDialogHeader>
                <AlertDialogTitle>
                  ¿Estás seguro de cancelar este pedido?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. El pedido no sumará a la
                  facturación.
                </AlertDialogDescription>
              </AlertDialogHeader>

              {errorMsg && cancelOpen && (
                <p className="text-xs font-body font-bold text-destructive">
                  {errorMsg}
                </p>
              )}

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isCancelling}>
                  Volver
                </AlertDialogCancel>
                <AlertDialogAction
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <>
                      <LoaderCircle className="animate-spin" />
                      Cancelando…
                    </>
                  ) : (
                    'Sí, cancelar pedido'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      {errorMsg && !cancelOpen && (
        <span className="hidden md:inline text-destructive text-xs font-body max-w-[180px] truncate">
          {errorMsg}
        </span>
      )}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pedido #{order.id.slice(0, 8).toUpperCase()}</DialogTitle>
            <DialogDescription>
              {order.customer_name} · {order.customer_phone ?? 'Sin teléfono'}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 max-h-[55vh] space-y-2 overflow-y-auto pr-1">
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground font-body">
                Esta orden no tiene productos registrados.
              </p>
            ) : (
              items.map((item, index) => {
                const name = item.product?.name ?? 'Producto sin nombre';
                const price = Number(item.product?.price ?? 0);
                const quantity = Number(item.quantity ?? 0);
                const subtotal = price * quantity;

                return (
                  <div
                    key={item.product?.id ?? `${name}-${index}`}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-background/40 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-sans text-sm font-bold text-foreground">
                        {name}
                      </p>
                      <p className="text-xs text-muted-foreground font-body">
                        {quantity} × {currencyFormatter.format(price)}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-bold text-foreground">
                      {currencyFormatter.format(subtotal)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
            <span className="text-sm text-muted-foreground font-body">
              Total del pedido
            </span>
            <span className="font-sans text-lg font-extrabold text-foreground">
              {currencyFormatter.format(Number(order.total || 0))}
            </span>
          </div>

          {errorMsg && (
            <p className="mt-2 text-xs font-body text-destructive">{errorMsg}</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
