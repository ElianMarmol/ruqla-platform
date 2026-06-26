'use server';

import { revalidatePath } from 'next/cache';
import { refresh } from 'next/cache';

import { promoDestinationToUrl } from '@/lib/promo-banner-destinations';
import { createClient } from '@/lib/supabase-server';
import { supabaseService } from '@/lib/supabase-service';
import { uploadImageToBucket } from '@/lib/storage-utils';

const IMAGES_BUCKET = 'products';

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

function parseMainBannerFields(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const subtitle = String(formData.get('subtitle') ?? '').trim() || null;
  const button_text = String(formData.get('button_text') ?? '').trim() || null;
  const button_link = String(formData.get('button_link') ?? '').trim() || null;

  if (!title) {
    throw new Error('El título es obligatorio.');
  }

  return { title, subtitle, button_text, button_link };
}

async function resolveFormImage(
  formData: FormData,
  fieldName: string,
  existingImageUrl?: string,
  requiredMessage = 'La imagen es obligatoria.'
): Promise<string> {
  const imageFile = formData.get(fieldName);
  const keepExisting = formData.get('keep_existing_image') === 'true';

  if (imageFile instanceof File && imageFile.size > 0) {
    return uploadImageToBucket(imageFile, IMAGES_BUCKET);
  }

  if (keepExisting && existingImageUrl) {
    return existingImageUrl;
  }

  if (existingImageUrl) {
    return existingImageUrl;
  }

  throw new Error(requiredMessage);
}

async function resolveBannerImage(
  formData: FormData,
  existingImageUrl?: string
): Promise<string> {
  return resolveFormImage(
    formData,
    'image',
    existingImageUrl,
    'La imagen del banner es obligatoria.'
  );
}

async function getNextMainBannerOrderIndex(): Promise<number> {
  const { data, error } = await supabaseService
    .from('main_banners')
    .select('order_index')
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data?.order_index ?? -1) + 1;
}

export async function createMainBannerAction(formData: FormData): Promise<void> {
  await requireAdminUser();

  const { title, subtitle, button_text, button_link } =
    parseMainBannerFields(formData);
  const image_url = await resolveBannerImage(formData);
  const order_index = await getNextMainBannerOrderIndex();

  const { error } = await supabaseService.from('main_banners').insert({
    title,
    subtitle,
    image_url,
    button_text,
    button_link,
    is_active: true,
    order_index,
  });

  if (error) {
    console.error('[main_banners] Create error:', error);
    throw new Error(error.message || 'No se pudo crear el banner.');
  }

  revalidateHomeCms();
}

export async function updateMainBannerAction(formData: FormData): Promise<void> {
  await requireAdminUser();

  const bannerId = String(formData.get('banner_id') ?? '').trim();
  if (!bannerId) throw new Error('Falta el id del banner.');

  const { title, subtitle, button_text, button_link } =
    parseMainBannerFields(formData);

  const { data: existing, error: fetchError } = await supabaseService
    .from('main_banners')
    .select('image_url')
    .eq('id', bannerId)
    .single();

  if (fetchError || !existing) {
    throw new Error('Banner no encontrado.');
  }

  const image_url = await resolveBannerImage(
    formData,
    existing.image_url ?? undefined
  );

  const { error } = await supabaseService
    .from('main_banners')
    .update({
      title,
      subtitle,
      image_url,
      button_text,
      button_link,
    })
    .eq('id', bannerId);

  if (error) {
    console.error('[main_banners] Update error:', error);
    throw new Error(error.message || 'No se pudo actualizar el banner.');
  }

  revalidateHomeCms();
}

export async function deleteMainBannerAction(bannerId: string): Promise<void> {
  await requireAdminUser();

  const trimmedId = bannerId.trim();
  if (!trimmedId) throw new Error('Falta el id del banner.');

  const { error } = await supabaseService
    .from('main_banners')
    .delete()
    .eq('id', trimmedId);

  if (error) {
    console.error('[main_banners] Delete error:', error);
    throw new Error(error.message || 'No se pudo eliminar el banner.');
  }

  revalidateHomeCms();
}

export async function toggleMainBannerActiveAction(
  bannerId: string,
  isActive: boolean
): Promise<void> {
  await requireAdminUser();

  const trimmedId = bannerId.trim();
  if (!trimmedId) throw new Error('Falta el id del banner.');

  const { error } = await supabaseService
    .from('main_banners')
    .update({ is_active: isActive })
    .eq('id', trimmedId);

  if (error) {
    console.error('[main_banners] Toggle active error:', error);
    throw new Error(error.message || 'No se pudo actualizar el estado.');
  }

  revalidateHomeCms();
}

const PROMO_SIZES = ['full', 'half'] as const;

function parsePromoBannerFields(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const subtitle = String(formData.get('subtitle') ?? '').trim() || null;
  const link_destination = String(formData.get('link_destination') ?? '').trim();
  const size = String(formData.get('size') ?? '').trim();

  if (!title) {
    throw new Error('El título es obligatorio.');
  }

  if (!PROMO_SIZES.includes(size as (typeof PROMO_SIZES)[number])) {
    throw new Error('Seleccioná un tamaño válido.');
  }

  const link_url = promoDestinationToUrl(link_destination);
  if (link_destination && link_destination !== '__none__' && !link_url) {
    throw new Error('Seleccioná un destino válido para el enlace.');
  }

  return { title, subtitle, link_url, size };
}

async function getNextPromoBannerOrderIndex(): Promise<number> {
  const { data, error } = await supabaseService
    .from('promo_banners')
    .select('order_index')
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data?.order_index ?? -1) + 1;
}

export async function createPromoBannerAction(formData: FormData): Promise<void> {
  await requireAdminUser();

  const { title, subtitle, link_url, size } = parsePromoBannerFields(formData);
  const image_url = await resolveBannerImage(formData);
  const order_index = await getNextPromoBannerOrderIndex();

  const { error } = await supabaseService.from('promo_banners').insert({
    title,
    subtitle,
    image_url,
    link_url,
    size,
    is_active: true,
    order_index,
  });

  if (error) {
    console.error('[promo_banners] Create error:', error);
    throw new Error(error.message || 'No se pudo crear el banner promo.');
  }

  revalidateHomeCms();
}

export async function updatePromoBannerAction(formData: FormData): Promise<void> {
  await requireAdminUser();

  const bannerId = String(formData.get('banner_id') ?? '').trim();
  if (!bannerId) throw new Error('Falta el id del banner.');

  const { title, subtitle, link_url, size } = parsePromoBannerFields(formData);

  const { data: existing, error: fetchError } = await supabaseService
    .from('promo_banners')
    .select('image_url')
    .eq('id', bannerId)
    .single();

  if (fetchError || !existing) {
    throw new Error('Banner promo no encontrado.');
  }

  const image_url = await resolveBannerImage(
    formData,
    existing.image_url ?? undefined
  );

  const { error } = await supabaseService
    .from('promo_banners')
    .update({
      title,
      subtitle,
      image_url,
      link_url,
      size,
    })
    .eq('id', bannerId);

  if (error) {
    console.error('[promo_banners] Update error:', error);
    throw new Error(error.message || 'No se pudo actualizar el banner promo.');
  }

  revalidateHomeCms();
}

export async function deletePromoBannerAction(bannerId: string): Promise<void> {
  await requireAdminUser();

  const trimmedId = bannerId.trim();
  if (!trimmedId) throw new Error('Falta el id del banner.');

  const { error } = await supabaseService
    .from('promo_banners')
    .delete()
    .eq('id', trimmedId);

  if (error) {
    console.error('[promo_banners] Delete error:', error);
    throw new Error(error.message || 'No se pudo eliminar el banner promo.');
  }

  revalidateHomeCms();
}

export async function togglePromoBannerActiveAction(
  bannerId: string,
  isActive: boolean
): Promise<void> {
  await requireAdminUser();

  const trimmedId = bannerId.trim();
  if (!trimmedId) throw new Error('Falta el id del banner.');

  const { error } = await supabaseService
    .from('promo_banners')
    .update({ is_active: isActive })
    .eq('id', trimmedId);

  if (error) {
    console.error('[promo_banners] Toggle active error:', error);
    throw new Error(error.message || 'No se pudo actualizar el estado.');
  }

  revalidateHomeCms();
}

function parsePartnerBrandFields(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();

  if (!name) {
    throw new Error('El nombre de la marca es obligatorio.');
  }

  return { name };
}

export async function createPartnerBrandAction(formData: FormData): Promise<void> {
  await requireAdminUser();

  const { name } = parsePartnerBrandFields(formData);
  const logo_url = await resolveFormImage(
    formData,
    'logo',
    undefined,
    'El logo de la marca es obligatorio.'
  );

  const { error } = await supabaseService.from('partner_brands').insert({
    name,
    logo_url,
    is_featured: false,
  });

  if (error) {
    console.error('[partner_brands] Create error:', error);
    throw new Error(error.message || 'No se pudo crear la marca.');
  }

  revalidateHomeCms();
}

export async function updatePartnerBrandAction(formData: FormData): Promise<void> {
  await requireAdminUser();

  const brandId = String(formData.get('brand_id') ?? '').trim();
  if (!brandId) throw new Error('Falta el id de la marca.');

  const { name } = parsePartnerBrandFields(formData);

  const { data: existing, error: fetchError } = await supabaseService
    .from('partner_brands')
    .select('logo_url')
    .eq('id', brandId)
    .single();

  if (fetchError || !existing) {
    throw new Error('Marca no encontrada.');
  }

  const logo_url = await resolveFormImage(
    formData,
    'logo',
    existing.logo_url ?? undefined,
    'El logo de la marca es obligatorio.'
  );

  const { error } = await supabaseService
    .from('partner_brands')
    .update({ name, logo_url })
    .eq('id', brandId);

  if (error) {
    console.error('[partner_brands] Update error:', error);
    throw new Error(error.message || 'No se pudo actualizar la marca.');
  }

  revalidateHomeCms();
}

export async function deletePartnerBrandAction(brandId: string): Promise<void> {
  await requireAdminUser();

  const trimmedId = brandId.trim();
  if (!trimmedId) throw new Error('Falta el id de la marca.');

  const { error } = await supabaseService
    .from('partner_brands')
    .delete()
    .eq('id', trimmedId);

  if (error) {
    console.error('[partner_brands] Delete error:', error);
    throw new Error(error.message || 'No se pudo eliminar la marca.');
  }

  revalidateHomeCms();
}

export async function togglePartnerBrandFeaturedAction(
  brandId: string,
  isFeatured: boolean
): Promise<void> {
  await requireAdminUser();

  const trimmedId = brandId.trim();
  if (!trimmedId) throw new Error('Falta el id de la marca.');

  const { error } = await supabaseService
    .from('partner_brands')
    .update({ is_featured: isFeatured })
    .eq('id', trimmedId);

  if (error) {
    console.error('[partner_brands] Toggle featured error:', error);
    throw new Error(error.message || 'No se pudo actualizar el destacado.');
  }

  revalidateHomeCms();
}
