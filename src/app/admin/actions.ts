'use server';

import { refresh, revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase-server';
import { supabaseService } from '@/lib/supabase-service';

const ALLOWED_STATUSES = ['pending', 'completed', 'cancelled'] as const;
type OrderStatus = (typeof ALLOWED_STATUSES)[number];

function isAllowedStatus(value: string): value is OrderStatus {
  return (ALLOWED_STATUSES as readonly string[]).includes(value);
}

type OrderLineItem = {
  product?: { id?: string };
  quantity?: number;
};

function parseOrderItems(raw: unknown): OrderLineItem[] {
  if (Array.isArray(raw)) {
    return raw as OrderLineItem[];
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as OrderLineItem[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

async function adjustOrderStock(
  items: OrderLineItem[],
  completing: boolean
): Promise<void> {
  for (const item of items) {
    const productId = item.product?.id?.trim();
    const quantity = Number(item.quantity);

    if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
      continue;
    }

    const { data: product, error: fetchError } = await supabaseService
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single();

    if (fetchError || !product) {
      console.error('[admin] Producto no encontrado para stock:', fetchError);
      throw new Error(
        `No se encontró el producto para ajustar inventario (id: ${productId}).`
      );
    }

    const currentStock = Number(product.stock);
    if (!Number.isFinite(currentStock)) {
      throw new Error(`Stock inválido para el producto ${productId}.`);
    }

    const newStock = completing
      ? Math.max(0, currentStock - quantity)
      : currentStock + quantity;

    const { error: updateError } = await supabaseService
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId);

    if (updateError) {
      console.error('[admin] Error actualizando stock del producto:', updateError);
      throw new Error(
        updateError.message || 'No se pudo actualizar el inventario del producto.'
      );
    }
  }
}

// Server Action invocada desde el panel admin para cambiar el estado de una orden.
export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  const supabaseAuth = await createClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    throw new Error('No autorizado. Iniciá sesión nuevamente.');
  }

  const orderId = String(formData.get('orderId') || '').trim();
  const rawStatus = String(formData.get('status') || '').trim();

  if (!orderId) {
    throw new Error('Falta el id de la orden.');
  }

  if (!isAllowedStatus(rawStatus)) {
    throw new Error(`Estado no permitido: ${rawStatus}`);
  }

  const { data: existingOrder, error: fetchOrderError } = await supabaseService
    .from('orders')
    .select('status, items')
    .eq('id', orderId)
    .single();

  if (fetchOrderError || !existingOrder) {
    console.error('[admin] Error obteniendo la orden:', fetchOrderError);
    throw new Error('Orden no encontrada.');
  }

  const oldStatus = String(existingOrder.status ?? '');
  const isCompleting = oldStatus !== 'completed' && rawStatus === 'completed';
  const isRestoring = oldStatus === 'completed' && rawStatus !== 'completed';

  if (isCompleting || isRestoring) {
    const lineItems = parseOrderItems(existingOrder.items);

    if (lineItems.length === 0) {
      throw new Error(
        'La orden no tiene ítems válidos para ajustar el inventario.'
      );
    }

    try {
      await adjustOrderStock(lineItems, isCompleting);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al ajustar el inventario.';
      throw new Error(message);
    }
  }

  const { error } = await supabaseService
    .from('orders')
    .update({ status: rawStatus })
    .eq('id', orderId);

  if (error) {
    console.error('[admin] Error actualizando el estado de la orden:', error);
    throw new Error(error.message || 'No se pudo actualizar la orden.');
  }

  revalidatePath('/admin');
  revalidatePath('/catalog');
  revalidatePath('/');
  refresh();
}
