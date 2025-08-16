import { supabase } from "@/integrations/supabase/client";

const FAMILY_PHOTOS_BUCKET = 'family-photos';

export async function uploadFamilyPhoto(
  file: File,
  userId: string,
  relativeId: string
): Promise<{ path?: string; error?: Error }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${relativeId}/${fileName}`;

    const { error } = await supabase.storage
      .from(FAMILY_PHOTOS_BUCKET)
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    return { path: filePath };
  } catch (error) {
    return { error: error as Error };
  }
}

export async function getFamilyPhotoUrl(path: string): Promise<string | null> {
  try {
    const { data } = await supabase.storage
      .from(FAMILY_PHOTOS_BUCKET)
      .getPublicUrl(path);

    return data.publicUrl;
  } catch (error) {
    console.error('Error getting photo URL:', error);
    return null;
  }
}

export async function getSignedFamilyPhotoUrl(path: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(FAMILY_PHOTOS_BUCKET)
      .createSignedUrl(path, 3600); // 1 hour

    if (error) throw error;
    return data.signedUrl;
  } catch (error) {
    console.error('Error getting signed photo URL:', error);
    return null;
  }
}

export async function deleteFamilyPhoto(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(FAMILY_PHOTOS_BUCKET)
      .remove([path]);

    return !error;
  } catch (error) {
    console.error('Error deleting photo:', error);
    return false;
  }
}