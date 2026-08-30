import { getSupabaseAsync, hasSupabaseEnv } from './supabase';

const BUCKET = 'wedding-photos';
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

/** Resizes to at most MAX_DIMENSION on the long edge and re-encodes as
 *  JPEG — a phone photo can be 10-20MB; guests uploading many of those
 *  would blow through free-tier storage fast. */
async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? file), 'image/jpeg', JPEG_QUALITY);
  });
}

export interface UploadResult {
  file: string;
  ok: boolean;
}

/** Uploads each photo individually so one bad/huge file doesn't fail the
 *  whole batch — callers get a per-file result to report partial success. */
export async function uploadPhotos(files: File[], guestName: string): Promise<UploadResult[]> {
  if (!hasSupabaseEnv()) {
    console.info('[photos] no backend configured, would upload:', files.map((f) => f.name));
    await new Promise((resolve) => setTimeout(resolve, 800));
    return files.map((f) => ({ file: f.name, ok: true }));
  }

  const supabase = await getSupabaseAsync();
  if (!supabase) return files.map((f) => ({ file: f.name, ok: false }));

  const results: UploadResult[] = [];
  for (const file of files) {
    try {
      const compressed = await compressImage(file);
      const ext = compressed.type === 'image/jpeg' ? 'jpg' : (file.name.split('.').pop() ?? 'jpg');
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, compressed, { contentType: compressed.type || 'image/jpeg' });
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from('photo_uploads')
        .insert({ storage_path: path, guest_name: guestName || null });
      if (insertError) throw insertError;

      results.push({ file: file.name, ok: true });
    } catch (err) {
      console.error('[photos] upload failed for', file.name, err);
      results.push({ file: file.name, ok: false });
    }
  }
  return results;
}
