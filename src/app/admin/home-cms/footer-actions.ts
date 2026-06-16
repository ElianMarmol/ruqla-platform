'use server';

import { revalidatePath } from 'next/cache';
import { refresh } from 'next/cache';

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

function revalidateFooter() {
  revalidatePath('/admin/home-cms');
  revalidatePath('/', 'layout');
  refresh();
}

function parseLinkFields(formData: FormData) {
  const label = String(formData.get('label') ?? '').trim();
  const href = String(formData.get('href') ?? '').trim();

  if (!label) throw new Error('El texto del enlace es obligatorio.');
  if (!href) throw new Error('La URL del enlace es obligatoria.');
  if (!href.startsWith('/') && !href.startsWith('http')) {
    throw new Error('La URL debe comenzar con / o http.');
  }

  return { label, href };
}

async function getNextLinkOrderIndex(): Promise<number> {
  const { data, error } = await supabaseService
    .from('store_footer_links')
    .select('order_index')
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data?.order_index ?? -1) + 1;
}

export async function updateStoreFooterSectionAction(
  formData: FormData
): Promise<void> {
  await requireAdminUser();

  const is_active = formData.get('is_active') === 'on';
  const copyright_text = String(formData.get('copyright_text') ?? '').trim();

  if (!copyright_text) {
    throw new Error('El texto de copyright es obligatorio.');
  }

  const { data: existing, error: fetchError } = await supabaseService
    .from('store_footer')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message || 'No se pudo cargar el footer.');
  }

  if (existing) {
    const { error } = await supabaseService
      .from('store_footer')
      .update({
        is_active,
        copyright_text,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseService
      .from('store_footer')
      .insert({ is_active, copyright_text });
    if (error) throw new Error(error.message);
  }

  revalidateFooter();
}

export async function createStoreFooterLinkAction(
  formData: FormData
): Promise<void> {
  await requireAdminUser();

  const { label, href } = parseLinkFields(formData);
  const order_index = await getNextLinkOrderIndex();

  const { error } = await supabaseService.from('store_footer_links').insert({
    label,
    href,
    order_index,
    is_active: true,
  });

  if (error) throw new Error(error.message || 'No se pudo crear el enlace.');
  revalidateFooter();
}

export async function updateStoreFooterLinkAction(
  formData: FormData
): Promise<void> {
  await requireAdminUser();

  const linkId = String(formData.get('link_id') ?? '').trim();
  if (!linkId) throw new Error('Falta el id del enlace.');

  const { label, href } = parseLinkFields(formData);

  const { error } = await supabaseService
    .from('store_footer_links')
    .update({ label, href })
    .eq('id', linkId);

  if (error) throw new Error(error.message || 'No se pudo actualizar el enlace.');
  revalidateFooter();
}

export async function deleteStoreFooterLinkAction(linkId: string): Promise<void> {
  await requireAdminUser();

  const trimmedId = linkId.trim();
  if (!trimmedId) throw new Error('Falta el id del enlace.');

  const { error } = await supabaseService
    .from('store_footer_links')
    .delete()
    .eq('id', trimmedId);

  if (error) throw new Error(error.message || 'No se pudo eliminar el enlace.');
  revalidateFooter();
}

export async function toggleStoreFooterLinkActiveAction(
  linkId: string,
  isActive: boolean
): Promise<void> {
  await requireAdminUser();

  const trimmedId = linkId.trim();
  if (!trimmedId) throw new Error('Falta el id del enlace.');

  const { error } = await supabaseService
    .from('store_footer_links')
    .update({ is_active: isActive })
    .eq('id', trimmedId);

  if (error) throw new Error(error.message || 'No se pudo actualizar el enlace.');
  revalidateFooter();
}

export async function reorderStoreFooterLinksAction(
  orderedIds: string[]
): Promise<void> {
  await requireAdminUser();

  if (!orderedIds.length) return;

  for (let index = 0; index < orderedIds.length; index++) {
    const id = orderedIds[index]?.trim();
    if (!id) continue;

    const { error } = await supabaseService
      .from('store_footer_links')
      .update({ order_index: index })
      .eq('id', id);

    if (error) {
      throw new Error(error.message || 'No se pudo reordenar los enlaces.');
    }
  }

  revalidateFooter();
}
