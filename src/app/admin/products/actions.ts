'use server';

import { revalidatePath } from 'next/cache';
import { refresh } from 'next/cache';

import { createClient } from '@/lib/supabase-server';
import { supabaseService } from '@/lib/supabase-service';
import { isMissingSchemaError } from '@/lib/supabase-errors';
import { uploadImageToBucket } from '@/lib/storage-utils';

const PRODUCTS_BUCKET = 'products';
const MAX_PRODUCT_IMAGES = 15;

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

function parseOptionalNumber(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

function parseProductFields(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim() || null;
  const price = Number(formData.get('price'));
  const originalPrice = parseOptionalNumber(formData.get('original_price'));
  const stock = parseInt(String(formData.get('stock') ?? ''), 10);

  if (!name) throw new Error('El nombre es obligatorio.');
  if (!Number.isFinite(price) || price < 0) {
    throw new Error('El precio actual debe ser un número válido.');
  }
  if (originalPrice !== null && (!Number.isFinite(originalPrice) || originalPrice < 0)) {
    throw new Error('El precio original debe ser un número válido.');
  }
  if (!Number.isFinite(stock) || stock < 0) {
    throw new Error('El stock debe ser un número entero mayor o igual a 0.');
  }

  return { name, description, price, originalPrice, stock };
}

function parseCategoryIds(formData: FormData): string[] {
  const ids = formData
    .getAll('category_ids')
    .map((value) => String(value).trim())
    .filter(Boolean);

  return [...new Set(ids)];
}

function parseKeptImages(formData: FormData, existingImages: string[]): string[] {
  const raw = String(formData.get('kept_images') ?? '').trim();
  if (!raw) return existingImages;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return existingImages;
    return parsed.filter((url): url is string => typeof url === 'string');
  } catch {
    return existingImages;
  }
}

async function resolveImages(
  formData: FormData,
  existingImages: string[] = []
): Promise<string[]> {
  const kept = parseKeptImages(formData, existingImages);
  const newFiles = formData
    .getAll('images')
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  const uploaded: string[] = [];
  for (const file of newFiles) {
    const url = await uploadImageToBucket(file, PRODUCTS_BUCKET);
    uploaded.push(url);
  }

  const combined = [...kept, ...uploaded];
  if (combined.length > MAX_PRODUCT_IMAGES) {
    throw new Error(`Podés subir hasta ${MAX_PRODUCT_IMAGES} imágenes por producto.`);
  }

  return combined;
}

async function syncProductCategories(
  productId: string,
  categoryIds: string[]
): Promise<void> {
  const { error: deleteError } = await supabaseService
    .from('product_categories')
    .delete()
    .eq('product_id', productId);

  if (deleteError) {
    if (isMissingSchemaError(deleteError)) return;
    throw new Error(deleteError.message || 'No se pudieron actualizar las categorías.');
  }

  if (categoryIds.length > 0) {
    const { error: insertError } = await supabaseService
      .from('product_categories')
      .insert(
        categoryIds.map((category_id) => ({
          product_id: productId,
          category_id,
        }))
      );

    if (insertError) {
      if (isMissingSchemaError(insertError)) return;
      throw new Error(insertError.message || 'No se pudieron guardar las categorías.');
    }
  }

  const primaryCategoryId = categoryIds[0] ?? null;
  const { error: updateError } = await supabaseService
    .from('products')
    .update({ category_id: primaryCategoryId })
    .eq('id', productId);

  if (updateError) {
    throw new Error(updateError.message || 'No se pudo sincronizar la categoría principal.');
  }
}

function revalidateProductsAdmin() {
  revalidatePath('/admin/products');
  revalidatePath('/productos');
  revalidatePath('/catalog');
  revalidatePath('/');
  refresh();
}

export async function createProductAction(formData: FormData): Promise<void> {
  await requireAdminUser();
  const { name, description, price, originalPrice, stock } =
    parseProductFields(formData);
  const categoryIds = parseCategoryIds(formData);
  const images = await resolveImages(formData, []);

  const { data: created, error } = await supabaseService
    .from('products')
    .insert({
      name,
      description,
      price,
      original_price: originalPrice,
      stock,
      images,
      category_id: categoryIds[0] ?? null,
      specs: {},
    })
    .select('id')
    .single();

  if (error || !created) {
    console.error('[products] Create error:', error);
    throw new Error(error?.message || 'No se pudo crear el producto.');
  }

  await syncProductCategories(created.id, categoryIds);
  revalidateProductsAdmin();
}

export async function updateProductAction(formData: FormData): Promise<void> {
  await requireAdminUser();

  const productId = String(formData.get('product_id') ?? '').trim();
  if (!productId) throw new Error('Falta el id del producto.');

  const { name, description, price, originalPrice, stock } =
    parseProductFields(formData);
  const categoryIds = parseCategoryIds(formData);

  const { data: existing, error: fetchError } = await supabaseService
    .from('products')
    .select('images')
    .eq('id', productId)
    .single();

  if (fetchError || !existing) {
    throw new Error('Producto no encontrado.');
  }

  const images = await resolveImages(
    formData,
    Array.isArray(existing.images) ? existing.images : []
  );

  const { error } = await supabaseService
    .from('products')
    .update({
      name,
      description,
      price,
      original_price: originalPrice,
      stock,
      images,
      category_id: categoryIds[0] ?? null,
    })
    .eq('id', productId);

  if (error) {
    console.error('[products] Update error:', error);
    throw new Error(error.message || 'No se pudo actualizar el producto.');
  }

  await syncProductCategories(productId, categoryIds);
  revalidateProductsAdmin();
}

export async function deleteProductAction(productId: string): Promise<void> {
  await requireAdminUser();

  if (!productId?.trim()) {
    throw new Error('Falta el id del producto.');
  }

  const { error } = await supabaseService
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error('[products] Delete error:', error);
    throw new Error(error.message || 'No se pudo eliminar el producto.');
  }

  revalidateProductsAdmin();
}

export async function toggleProductFeaturedAction(
  productId: string,
  isFeatured: boolean
): Promise<void> {
  await requireAdminUser();

  const trimmedId = productId.trim();
  if (!trimmedId) {
    throw new Error('Falta el id del producto.');
  }

  const { error } = await supabaseService
    .from('products')
    .update({ is_featured: isFeatured })
    .eq('id', trimmedId);

  if (error) {
    console.error('[products] Toggle featured error:', error);
    throw new Error(error.message || 'No se pudo actualizar el destacado.');
  }

  revalidateProductsAdmin();
}
