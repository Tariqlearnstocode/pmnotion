import { supabase } from '../lib/supabaseClient';

const STORAGE_BUCKET = 'entry_files'; // Define your bucket name

/**
 * Uploads a file to the specified Supabase Storage bucket.
 * @param file The file object to upload.
 * @param pathPrefix Optional prefix for the file path (e.g., 'userId/entryId/').
 * @returns The path of the uploaded file in the bucket.
 */
export async function uploadFile(file: File, pathPrefix: string = ''): Promise<string> {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  // Create a unique file path
  const fileExt = file.name.split('.').pop();
  const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${pathPrefix}${uniqueFileName}`.replace(/\/+/g, '/'); // Ensure single slashes

  console.log(`Uploading file to: ${STORAGE_BUCKET}/${filePath}`);

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600', // Optional: cache for 1 hour
      upsert: false, // Don't overwrite existing files (should be unique anyway)
    });

  if (error) {
    console.error('Error uploading file:', error);
    throw error;
  }

  if (!data || !data.path) {
    throw new Error('File upload succeeded but no path returned.');
  }

  console.log("Upload successful, path:", data.path);
  return data.path; // Return the path within the bucket
}

/**
 * Gets the public URL for a file in the specified bucket.
 * Assumes the bucket is configured for public access.
 * @param filePath The path of the file within the bucket.
 * @returns The public URL object.
 */
export function getFileUrl(filePath: string): { publicUrl: string } | null {
  if (!filePath) return null;

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  if (!data || !data.publicUrl) {
    console.warn(`Could not get public URL for path: ${filePath}`);
    return null;
  }

  return data;
}

// Optional: Function to delete a file
export async function deleteFile(filePath: string): Promise<boolean> {
  if (!filePath) {
    console.warn('deleteFile called without filePath');
    return false;
  }
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([filePath]);

  if (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    // Don't necessarily throw, maybe just log and return false
    return false;
  }
  return true;
} 