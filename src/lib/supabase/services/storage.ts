import { getSupabaseBrowserClient } from '../client';
import { SUPABASE_CONFIG } from '../config';

export const LISTING_IMAGES_BUCKET = 'listing-images';

export interface UploadResult {
  url: string;
  storagePath: string;
}

/**
 * Converts a file to base64 string for reliable local storage persistence
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Uploads a property image to Supabase Storage in the 'listing-images' bucket.
 * Organizes files into user-scoped paths: `${userId}/${listingId}/${timestamp}_${fileName}`
 */
export async function uploadListingImage(
  file: File,
  userId: string,
  listingId: string,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  if (onProgress) onProgress(20);

  const client = getSupabaseBrowserClient();
  if (!client) {
    if (onProgress) onProgress(60);
    // If Supabase is not configured, create a reliable base64 or blob URL
    const base64Url = await fileToBase64(file);
    if (onProgress) onProgress(100);
    return {
      url: base64Url,
      storagePath: `mock/${userId}/${listingId}/${file.name}`,
    };
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${userId}/${listingId}/${Date.now()}_${cleanFileName}`;

  if (onProgress) onProgress(50);

  const { data, error } = await client.storage
    .from(LISTING_IMAGES_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  if (onProgress) onProgress(85);

  const { data: publicUrlData } = client.storage
    .from(LISTING_IMAGES_BUCKET)
    .getPublicUrl(data.path);

  if (onProgress) onProgress(100);

  return {
    url: publicUrlData.publicUrl,
    storagePath: data.path,
  };
}


/**
 * Deletes an image from the 'listing-images' bucket.
 */
export async function deleteListingImage(storagePath: string): Promise<boolean> {
  const client = getSupabaseBrowserClient();
  if (!client || storagePath.startsWith('mock/')) {
    return true;
  }

  const { error } = await client.storage
    .from(LISTING_IMAGES_BUCKET)
    .remove([storagePath]);

  if (error) {
    console.error('Error deleting image from storage:', error);
    return false;
  }

  return true;
}

/**
 * Gets public URL for an image storage path.
 */
export function getListingImagePublicUrl(storagePath: string): string {
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    return storagePath;
  }
  if (!SUPABASE_CONFIG.url) {
    return storagePath;
  }
  return `${SUPABASE_CONFIG.url}/storage/v1/object/public/${LISTING_IMAGES_BUCKET}/${storagePath}`;
}
