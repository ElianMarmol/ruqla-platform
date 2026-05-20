import { randomUUID } from 'crypto';

import { supabaseService } from '@/lib/supabase-service';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function uploadImageToBucket(
  file: File,
  bucketName: string
): Promise<string> {
  if (!file.size) {
    throw new Error('Seleccioná una imagen válida.');
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('La imagen no puede superar 5 MB.');
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Formato no permitido. Usá JPG, PNG, WebP o GIF.');
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filePath = `${randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabaseService.storage
    .from(bucketName)
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
      cacheControl: '3600',
    });

  if (uploadError) {
    console.error(`[storage] Upload error (${bucketName}):`, uploadError);
    throw new Error(
      uploadError.message.includes('Bucket not found')
        ? `El bucket "${bucketName}" no existe en Supabase Storage.`
        : `No se pudo subir la imagen: ${uploadError.message}`
    );
  }

  const { data: publicData } = supabaseService.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  if (!publicData?.publicUrl) {
    throw new Error('No se pudo obtener la URL pública de la imagen.');
  }

  return publicData.publicUrl;
}
