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

function revalidateShopHeader() {
  revalidatePath('/admin/home-cms');
  revalidatePath('/productos');
  refresh();
}

function parseShopHeaderFields(formData: FormData) {
  const eyebrow = String(formData.get('eyebrow') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  const title_highlight =
    String(formData.get('title_highlight') ?? '').trim() || null;
  const subtitle = String(formData.get('subtitle') ?? '').trim() || null;
  const is_active = formData.get('is_active') === 'on';

  if (!title) {
    throw new Error('El título principal es obligatorio.');
  }

  return { eyebrow, title, title_highlight, subtitle, is_active };
}

export async function updateShopPageHeaderAction(
  formData: FormData
): Promise<void> {
  await requireAdminUser();

  const fields = parseShopHeaderFields(formData);

  const { data: existing, error: fetchError } = await supabaseService
    .from('shop_page_header')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    console.error('[shop_page_header] Fetch error:', fetchError);
    throw new Error(fetchError.message || 'No se pudo cargar el encabezado.');
  }

  if (existing) {
    const { error } = await supabaseService
      .from('shop_page_header')
      .update({
        ...fields,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (error) {
      console.error('[shop_page_header] Update error:', error);
      throw new Error(error.message || 'No se pudo actualizar el encabezado.');
    }
  } else {
    const { error } = await supabaseService.from('shop_page_header').insert(fields);

    if (error) {
      console.error('[shop_page_header] Insert error:', error);
      throw new Error(error.message || 'No se pudo crear el encabezado.');
    }
  }

  revalidateShopHeader();
}
