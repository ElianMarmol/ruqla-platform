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

function revalidateTrustFeatures() {
  revalidatePath('/admin/home-cms');
  revalidatePath('/', 'layout');
  refresh();
}

function parseItemFields(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const icon = String(formData.get('icon') ?? 'star').trim() || 'star';

  if (!title) {
    throw new Error('El título es obligatorio.');
  }

  return { title, description, icon };
}

async function getNextItemOrderIndex(): Promise<number> {
  const { data, error } = await supabaseService
    .from('store_trust_features_items')
    .select('order_index')
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data?.order_index ?? -1) + 1;
}

export async function updateStoreTrustFeaturesSectionAction(
  formData: FormData
): Promise<void> {
  await requireAdminUser();

  const is_active = formData.get('is_active') === 'on';

  const { data: existing, error: fetchError } = await supabaseService
    .from('store_trust_features')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    throw new Error(
      fetchError.message || 'No se pudo cargar la barra de beneficios.'
    );
  }

  if (existing) {
    const { error } = await supabaseService
      .from('store_trust_features')
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseService
      .from('store_trust_features')
      .insert({ is_active });
    if (error) throw new Error(error.message);
  }

  revalidateTrustFeatures();
}

export async function createStoreTrustFeaturesItemAction(
  formData: FormData
): Promise<void> {
  await requireAdminUser();

  const { title, description, icon } = parseItemFields(formData);
  const order_index = await getNextItemOrderIndex();

  const { error } = await supabaseService
    .from('store_trust_features_items')
    .insert({
      title,
      description,
      icon,
      order_index,
      is_active: true,
    });

  if (error) throw new Error(error.message || 'No se pudo crear el ítem.');
  revalidateTrustFeatures();
}

export async function updateStoreTrustFeaturesItemAction(
  formData: FormData
): Promise<void> {
  await requireAdminUser();

  const itemId = String(formData.get('item_id') ?? '').trim();
  if (!itemId) throw new Error('Falta el id del ítem.');

  const { title, description, icon } = parseItemFields(formData);

  const { error } = await supabaseService
    .from('store_trust_features_items')
    .update({ title, description, icon })
    .eq('id', itemId);

  if (error) throw new Error(error.message || 'No se pudo actualizar el ítem.');
  revalidateTrustFeatures();
}

export async function deleteStoreTrustFeaturesItemAction(
  itemId: string
): Promise<void> {
  await requireAdminUser();

  const trimmedId = itemId.trim();
  if (!trimmedId) throw new Error('Falta el id del ítem.');

  const { error } = await supabaseService
    .from('store_trust_features_items')
    .delete()
    .eq('id', trimmedId);

  if (error) throw new Error(error.message || 'No se pudo eliminar el ítem.');
  revalidateTrustFeatures();
}

export async function toggleStoreTrustFeaturesItemActiveAction(
  itemId: string,
  isActive: boolean
): Promise<void> {
  await requireAdminUser();

  const trimmedId = itemId.trim();
  if (!trimmedId) throw new Error('Falta el id del ítem.');

  const { error } = await supabaseService
    .from('store_trust_features_items')
    .update({ is_active: isActive })
    .eq('id', trimmedId);

  if (error) throw new Error(error.message || 'No se pudo actualizar el ítem.');
  revalidateTrustFeatures();
}

export async function reorderStoreTrustFeaturesItemsAction(
  orderedIds: string[]
): Promise<void> {
  await requireAdminUser();

  if (!orderedIds.length) return;

  for (let index = 0; index < orderedIds.length; index++) {
    const id = orderedIds[index]?.trim();
    if (!id) continue;

    const { error } = await supabaseService
      .from('store_trust_features_items')
      .update({ order_index: index })
      .eq('id', id);

    if (error) {
      throw new Error(error.message || 'No se pudo reordenar los ítems.');
    }
  }

  revalidateTrustFeatures();
}
