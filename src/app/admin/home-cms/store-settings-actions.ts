'use server';

import { revalidatePath } from 'next/cache';
import { refresh } from 'next/cache';

import { normalizePhoneNumber } from '@/lib/phone';
import { createClient } from '@/lib/supabase-server';
import { supabaseService } from '@/lib/supabase-service';

async function requireAdminUser() {
  const supabaseAuth = await createClient();
  const {
    data: { user },
    error,
  } = await supabaseAuth.auth.getUser();

  if (error || !user) {
    throw new Error('No autorizado. Iniciá sesión nuevamente.');
  }

  return user;
}

function revalidateStoreSettings() {
  revalidatePath('/admin/home-cms');
  revalidatePath('/', 'layout');
  refresh();
}

export async function updateStoreWhatsAppAction(
  formData: FormData
): Promise<void> {
  await requireAdminUser();

  const raw = String(formData.get('whatsapp_number') ?? '').trim();
  const whatsapp_number = normalizePhoneNumber(raw);

  if (whatsapp_number.length < 10) {
    throw new Error('Ingresá un número de WhatsApp válido (mínimo 10 dígitos).');
  }

  const { data: existing, error: fetchError } = await supabaseService
    .from('store_settings')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message || 'No se pudo cargar la configuración.');
  }

  if (existing) {
    const { error } = await supabaseService
      .from('store_settings')
      .update({
        whatsapp_number,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseService
      .from('store_settings')
      .insert({ whatsapp_number });
    if (error) throw new Error(error.message);
  }

  revalidateStoreSettings();
}

function parseNavLinkFields(formData: FormData) {
  const label = String(formData.get('label') ?? '').trim().toUpperCase();
  const category_id = String(formData.get('category_id') ?? '').trim() || null;
  const fallback_slug = String(formData.get('fallback_slug') ?? '').trim();

  if (!label) throw new Error('El texto del enlace es obligatorio.');
  if (!category_id && !fallback_slug) {
    throw new Error('Elegí una categoría o indicá un slug de respaldo.');
  }

  return { label, category_id, fallback_slug };
}

async function getNextNavLinkOrderIndex(): Promise<number> {
  const { data, error } = await supabaseService
    .from('store_nav_links')
    .select('order_index')
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data?.order_index ?? -1) + 1;
}

export async function createStoreNavLinkAction(formData: FormData): Promise<void> {
  await requireAdminUser();

  const fields = parseNavLinkFields(formData);
  const order_index = await getNextNavLinkOrderIndex();

  const { error } = await supabaseService.from('store_nav_links').insert({
    ...fields,
    order_index,
    is_active: true,
  });

  if (error) throw new Error(error.message || 'No se pudo crear el enlace.');
  revalidateStoreSettings();
}

export async function updateStoreNavLinkAction(formData: FormData): Promise<void> {
  await requireAdminUser();

  const linkId = String(formData.get('link_id') ?? '').trim();
  if (!linkId) throw new Error('Falta el id del enlace.');

  const fields = parseNavLinkFields(formData);

  const { error } = await supabaseService
    .from('store_nav_links')
    .update(fields)
    .eq('id', linkId);

  if (error) throw new Error(error.message || 'No se pudo actualizar el enlace.');
  revalidateStoreSettings();
}

export async function deleteStoreNavLinkAction(linkId: string): Promise<void> {
  await requireAdminUser();

  const trimmedId = linkId.trim();
  if (!trimmedId) throw new Error('Falta el id del enlace.');

  const { error } = await supabaseService
    .from('store_nav_links')
    .delete()
    .eq('id', trimmedId);

  if (error) throw new Error(error.message || 'No se pudo eliminar el enlace.');
  revalidateStoreSettings();
}

export async function toggleStoreNavLinkActiveAction(
  linkId: string,
  isActive: boolean
): Promise<void> {
  await requireAdminUser();

  const trimmedId = linkId.trim();
  if (!trimmedId) throw new Error('Falta el id del enlace.');

  const { error } = await supabaseService
    .from('store_nav_links')
    .update({ is_active: isActive })
    .eq('id', trimmedId);

  if (error) throw new Error(error.message || 'No se pudo actualizar el enlace.');
  revalidateStoreSettings();
}

export async function reorderStoreNavLinksAction(
  orderedIds: string[]
): Promise<void> {
  await requireAdminUser();

  for (let index = 0; index < orderedIds.length; index++) {
    const id = orderedIds[index]?.trim();
    if (!id) continue;

    const { error } = await supabaseService
      .from('store_nav_links')
      .update({ order_index: index })
      .eq('id', id);

    if (error) {
      throw new Error(error.message || 'No se pudo reordenar los enlaces.');
    }
  }

  revalidateStoreSettings();
}
