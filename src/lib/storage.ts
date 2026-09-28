import { supabase } from './supabase';
import type { SiteImage } from './supabase';

export const BUCKET_NAME = 'website-images';
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
];

export interface StorageOperationResult {
  path: string | null;
  publicUrl: string | null;
  error: Error | null;
}

/**
 * Validates file format and size
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file format (${file.type}). Allowed formats: JPG, PNG, WEBP, GIF, SVG, AVIF.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 10MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB.`,
    };
  }

  return { valid: true };
}

/**
 * Generates a public URL for an image stored in the website-images bucket
 */
export function getPublicUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Uploads an image file to Supabase Storage under the specified folder
 */
export async function uploadWebsiteImage(
  file: File,
  folder: 'hero' | 'services' | 'gallery'
): Promise<StorageOperationResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    return { path: null, publicUrl: null, error: new Error(validation.error) };
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const sanitizedBaseName = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9-_]/g, '_');
  const filePath = `${folder}/${Date.now()}_${sanitizedBaseName}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error || !data) {
    return { path: null, publicUrl: null, error: error || new Error('Upload failed') };
  }

  const publicUrl = getPublicUrl(data.path);
  return { path: data.path, publicUrl, error: null };
}

/**
 * Replaces an existing website image record and storage object
 */
export async function replaceWebsiteImage(
  imageRecordId: string,
  newFile: File,
  folder: 'hero' | 'services' | 'gallery',
  oldStoragePath?: string
): Promise<{ success: boolean; newUrl?: string; error?: Error }> {
  // 1. Upload new image
  const uploadResult = await uploadWebsiteImage(newFile, folder);
  if (uploadResult.error || !uploadResult.publicUrl) {
    return { success: false, error: uploadResult.error || new Error('Upload failed') };
  }

  // 2. Update site_images record
  const updateData: Partial<SiteImage> = {
    image_url: uploadResult.publicUrl,
    updated_at: new Date().toISOString(),
  };

  const { error: dbError } = await supabase
    .from('site_images')
    .update(updateData as never)
    .eq('id', imageRecordId);

  if (dbError) {
    return { success: false, error: dbError };
  }

  // 3. Clean up old storage object if path provided
  if (oldStoragePath) {
    await deleteStorageFile(oldStoragePath);
  }

  return { success: true, newUrl: uploadResult.publicUrl };
}

/**
 * Deletes a file from Supabase storage bucket
 */
export async function deleteStorageFile(path: string): Promise<{ error: Error | null }> {
  if (!path) return { error: null };
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);
  return { error };
}

/**
 * Deletes an image record from database and removes object from storage
 */
export async function deleteWebsiteImage(
  imageRecordId: string,
  storagePath?: string
): Promise<{ success: boolean; error?: Error }> {
  // 1. Update DB (or soft delete)
  const updateData: Partial<SiteImage> = { is_active: false };

  const { error: dbError } = await supabase
    .from('site_images')
    .update(updateData as never)
    .eq('id', imageRecordId);

  if (dbError) {
    return { success: false, error: dbError };
  }

  // 2. Delete storage file if path supplied
  if (storagePath) {
    await deleteStorageFile(storagePath);
  }

  return { success: true };
}
