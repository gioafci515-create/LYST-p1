import { useCallback, useEffect, useRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Lang } from '../../data/translations';

const BUCKET = 'wedding-photos';
const SIGNED_URL_TTL = 3600; // 1 hour — long enough for an admin browsing session

interface PhotoRow {
  id: string;
  storage_path: string;
  guest_name: string | null;
  created_at: string;
}

interface PhotoWithUrl extends PhotoRow {
  url: string | null;
}

const strings = {
  title: { ka: 'სტუმრების ფოტოები', ru: 'Фото от гостей', en: 'Guest photos' },
  empty: { ka: 'ჯერ არცერთი ფოტო არ არის', ru: 'Пока нет фото', en: 'No photos yet' },
  unknownGuest: { ka: 'უცნობი სტუმარი', ru: 'Неизвестный гость', en: 'Unknown guest' },
  delete: { ka: 'წაშლა', ru: 'Удалить', en: 'Delete' },
} as const;

export function PhotoGallery({ supabase, lang }: { supabase: SupabaseClient; lang: Lang }) {
  const s = (key: keyof typeof strings) => strings[key][lang];
  const [photos, setPhotos] = useState<PhotoWithUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('photo_uploads')
      .select('*')
      .order('created_at', { ascending: false });
    if (!mountedRef.current) return;
    if (error || !data) {
      setLoading(false);
      return;
    }
    const rows = data as PhotoRow[];
    const withUrls = await Promise.all(
      rows.map(async (row) => {
        const { data: signed } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(row.storage_path, SIGNED_URL_TTL);
        return { ...row, url: signed?.signedUrl ?? null };
      }),
    );
    if (!mountedRef.current) return;
    setPhotos(withUrls);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    mountedRef.current = true;
    void load();
    const channel = supabase
      .channel('photo-uploads-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'photo_uploads' },
        () => void load(),
      )
      .subscribe();
    return () => {
      mountedRef.current = false;
      void supabase.removeChannel(channel);
    };
  }, [supabase, load]);

  const handleDelete = async (photo: PhotoWithUrl) => {
    await supabase.storage.from(BUCKET).remove([photo.storage_path]);
    await supabase.from('photo_uploads').delete().eq('id', photo.id);
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
  };

  return (
    <section className="admin__photos">
      <h2 className="admin__section-title">{s('title')}</h2>
      {!loading && photos.length === 0 ? (
        <p className="admin__empty">{s('empty')}</p>
      ) : (
        <div className="admin__photo-grid">
          {photos.map((photo) => (
            <figure key={photo.id} className="admin__photo-card">
              {photo.url && <img src={photo.url} alt="" loading="lazy" />}
              <figcaption>
                <span>{photo.guest_name || s('unknownGuest')}</span>
                <button
                  type="button"
                  className="admin__photo-delete"
                  onClick={() => void handleDelete(photo)}
                  aria-label={s('delete')}
                >
                  ×
                </button>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
