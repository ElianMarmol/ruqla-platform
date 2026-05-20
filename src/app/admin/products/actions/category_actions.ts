'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase-server';
import { supabaseService } from '@/lib/supabase-service';

import { nameToSlug } from '../lib/category-utils';

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

function revalidateProductsAdmin() {
  revalidatePath('/admin/products');
}

export async function createCategoryAction(name: string): Promise<void> {
  await requireAdminUser();

  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('El nombre de la categoría es obligatorio.');
  }

  const slug = nameToSlug(trimmed);
  if (!slug) {
    throw new Error('No se pudo generar un slug válido.');
  }

  const { error } = await supabaseService.from('categories').insert({
    name: trimmed,
    slug,
  });

  if (error) {
    console.error('[categories] Create error:', error);
    if (error.code === '23505') {
      throw new Error('Ya existe una categoría con ese nombre o slug.');
    }
    throw new Error(error.message || 'No se pudo crear la categoría.');
  }

  revalidateProductsAdmin();
}

export async function updateCategoryAction(
  id: string,
  name: string,
  slug: string
): Promise<void> {
  await requireAdminUser();

  const trimmedId = id.trim();
  const trimmedName = name.trim();
  const trimmedSlug = slug.trim();

  if (!trimmedId) throw new Error('Falta el id de la categoría.');
  if (!trimmedName) throw new Error('El nombre es obligatorio.');
  if (!trimmedSlug) throw new Error('El slug es obligatorio.');

  const { error } = await supabaseService
    .from('categories')
    .update({ name: trimmedName, slug: trimmedSlug })
    .eq('id', trimmedId);

  if (error) {
    console.error('[categories] Update error:', error);
    if (error.code === '23505') {
      throw new Error('Ya existe otra categoría con ese slug.');
    }
    throw new Error(error.message || 'No se pudo actualizar la categoría.');
  }

  revalidateProductsAdmin();
}

export async function deleteCategoryAction(id: string): Promise<void> {
  await requireAdminUser();

  const trimmedId = id.trim();
  if (!trimmedId) throw new Error('Falta el id de la categoría.');

  try {
    const { error } = await supabaseService
      .from('categories')
      .delete()
      .eq('id', trimmedId);

    if (error) {
      console.error('[categories] Delete error:', error);
      if (
        error.code === '23503' ||
        error.message?.toLowerCase().includes('foreign key')
      ) {
        throw new Error(
          'No se puede borrar porque hay productos usándola.'
        );
      }
      throw new Error(error.message || 'No se pudo eliminar la categoría.');
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('productos usándola')) {
      throw err;
    }
    const message = err instanceof Error ? err.message : String(err);
    if (
      message.includes('23503') ||
      message.toLowerCase().includes('foreign key')
    ) {
      throw new Error('No se puede borrar porque hay productos usándola.');
    }
    throw err instanceof Error
      ? err
      : new Error('No se pudo eliminar la categoría.');
  }

  revalidateProductsAdmin();
}

export async function reorderCategoriesAction(
  orderedIds: string[]
): Promise<void> {
  await requireAdminUser();

  if (!orderedIds.length) return;

  for (let index = 0; index < orderedIds.length; index++) {
    const id = orderedIds[index]?.trim();
    if (!id) continue;

    const { error } = await supabaseService
      .from('categories')
      .update({ order_index: index })
      .eq('id', id);

    if (error) {
      console.error('[categories] Reorder error:', error);
      throw new Error(error.message || 'No se pudo reordenar las categorías.');
    }
  }

  revalidateProductsAdmin();
}
