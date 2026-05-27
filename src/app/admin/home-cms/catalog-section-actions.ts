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

function revalidateHomeCms() {
  revalidatePath('/admin/home-cms');
  revalidatePath('/');
  refresh();
}

function parseSectionFields(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const subtitle = String(formData.get('subtitle') ?? '').trim() || null;
  const is_active = formData.get('is_active') === 'on';

  if (!title) {
    throw new Error('El título de la sección es obligatorio.');
  }

  return { title, subtitle, is_active };
}

function parseCardFields(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const icon = String(formData.get('icon') ?? 'box').trim() || 'box';
  const category_id = String(formData.get('category_id') ?? '').trim() || null;
  const fallback_slug = String(formData.get('fallback_slug') ?? '').trim();

  if (!title) {
    throw new Error('El título de la tarjeta es obligatorio.');
  }

  if (!category_id && !fallback_slug) {
    throw new Error('Elegí una categoría o indicá un slug de respaldo.');
  }

  return { title, icon, category_id, fallback_slug };
}

async function getNextCardOrderIndex(): Promise<number> {
  const { data, error } = await supabaseService
    .from('home_catalog_cards')
    .select('order_index')
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data?.order_index ?? -1) + 1;
}

export async function updateHomeCatalogSectionAction(
  formData: FormData
): Promise<void> {
  await requireAdminUser();

  const fields = parseSectionFields(formData);

  const { data: existing, error: fetchError } = await supabaseService
    .from('home_catalog_section')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    console.error('[home_catalog_section] Fetch error:', fetchError);
    throw new Error(fetchError.message || 'No se pudo cargar la sección.');
  }

  if (existing) {
    const { error } = await supabaseService
      .from('home_catalog_section')
      .update({
        ...fields,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (error) {
      console.error('[home_catalog_section] Update error:', error);
      throw new Error(error.message || 'No se pudo actualizar la sección.');
    }
  } else {
    const { error } = await supabaseService
      .from('home_catalog_section')
      .insert(fields);

    if (error) {
      console.error('[home_catalog_section] Insert error:', error);
      throw new Error(error.message || 'No se pudo crear la sección.');
    }
  }

  revalidateHomeCms();
}

export async function createHomeCatalogCardAction(
  formData: FormData
): Promise<void> {
  await requireAdminUser();

  const { title, icon, category_id, fallback_slug } = parseCardFields(formData);
  const order_index = await getNextCardOrderIndex();

  const { error } = await supabaseService.from('home_catalog_cards').insert({
    title,
    icon,
    category_id,
    fallback_slug,
    order_index,
    is_active: true,
  });

  if (error) {
    console.error('[home_catalog_cards] Create error:', error);
    throw new Error(error.message || 'No se pudo crear la tarjeta.');
  }

  revalidateHomeCms();
}

export async function updateHomeCatalogCardAction(
  formData: FormData
): Promise<void> {
  await requireAdminUser();

  const cardId = String(formData.get('card_id') ?? '').trim();
  if (!cardId) throw new Error('Falta el id de la tarjeta.');

  const { title, icon, category_id, fallback_slug } = parseCardFields(formData);

  const { error } = await supabaseService
    .from('home_catalog_cards')
    .update({ title, icon, category_id, fallback_slug })
    .eq('id', cardId);

  if (error) {
    console.error('[home_catalog_cards] Update error:', error);
    throw new Error(error.message || 'No se pudo actualizar la tarjeta.');
  }

  revalidateHomeCms();
}

export async function deleteHomeCatalogCardAction(cardId: string): Promise<void> {
  await requireAdminUser();

  const trimmedId = cardId.trim();
  if (!trimmedId) throw new Error('Falta el id de la tarjeta.');

  const { error } = await supabaseService
    .from('home_catalog_cards')
    .delete()
    .eq('id', trimmedId);

  if (error) {
    console.error('[home_catalog_cards] Delete error:', error);
    throw new Error(error.message || 'No se pudo eliminar la tarjeta.');
  }

  revalidateHomeCms();
}

export async function toggleHomeCatalogCardActiveAction(
  cardId: string,
  isActive: boolean
): Promise<void> {
  await requireAdminUser();

  const trimmedId = cardId.trim();
  if (!trimmedId) throw new Error('Falta el id de la tarjeta.');

  const { error } = await supabaseService
    .from('home_catalog_cards')
    .update({ is_active: isActive })
    .eq('id', trimmedId);

  if (error) {
    console.error('[home_catalog_cards] Toggle active error:', error);
    throw new Error(error.message || 'No se pudo actualizar el estado.');
  }

  revalidateHomeCms();
}

export async function reorderHomeCatalogCardsAction(
  orderedIds: string[]
): Promise<void> {
  await requireAdminUser();

  if (!orderedIds.length) return;

  for (let index = 0; index < orderedIds.length; index++) {
    const id = orderedIds[index]?.trim();
    if (!id) continue;

    const { error } = await supabaseService
      .from('home_catalog_cards')
      .update({ order_index: index })
      .eq('id', id);

    if (error) {
      console.error('[home_catalog_cards] Reorder error:', error);
      throw new Error(error.message || 'No se pudo reordenar las tarjetas.');
    }
  }

  revalidateHomeCms();
}
