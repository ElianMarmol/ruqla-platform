'use server';

import { revalidatePath } from 'next/cache';
import { refresh } from 'next/cache';

import { createClient } from '@/lib/supabase-server';
import { supabaseService } from '@/lib/supabase-service';
import { uploadImageToBucket } from '@/lib/storage-utils';

const PRODUCTS_BUCKET = 'products';

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

  const categoryRaw = String(formData.get('category_id') ?? '').trim();
  const category_id = categoryRaw || null;

  return { name, description, price, originalPrice, stock, category_id };
}

async function resolveImages(
  formData: FormData,
  existingImages: string[] = []
): Promise<string[]> {
  const imageFile = formData.get('image');
  const keepExisting = formData.get('keep_existing_image') === 'true';

  if (imageFile instanceof File && imageFile.size > 0) {
    const url = await uploadImageToBucket(imageFile, PRODUCTS_BUCKET);
    return [url];
  }

  if (keepExisting && existingImages.length > 0) {
    return existingImages;
  }

  return existingImages;
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
  const { name, description, price, originalPrice, stock, category_id } =
    parseProductFields(formData);

  const images = await resolveImages(formData, []);

  const { error } = await supabaseService.from('products').insert({
    name,
    description,
    price,
    original_price: originalPrice,
    stock,
    images,
    category_id,
    specs: {},
  });

  if (error) {
    console.error('[products] Create error:', error);
    throw new Error(error.message || 'No se pudo crear el producto.');
  }

  revalidateProductsAdmin();
}

export async function updateProductAction(formData: FormData): Promise<void> {
  await requireAdminUser();

  const productId = String(formData.get('product_id') ?? '').trim();
  if (!productId) throw new Error('Falta el id del producto.');

  const { name, description, price, originalPrice, stock, category_id } =
    parseProductFields(formData);

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
      category_id,
    })
    .eq('id', productId);

  if (error) {
    console.error('[products] Update error:', error);
    throw new Error(error.message || 'No se pudo actualizar el producto.');
  }

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
