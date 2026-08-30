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
  close: { ka: 'დახურვა', ru: 'Закрыть', en: 'Close' },
  download: { ka: 'ჩამოტვირთვა', ru: 'Скачать', en: 'Download' },
  downloading: { ka: 'იტვირთება…', ru: 'Загрузка…', en: 'Downloading…' },
  downloadFailed: {
    ka: 'ჩამოტვირთვა ვერ მოხერხდა',
    ru: 'Не удалось скачать',
    en: "Couldn't download",
  },
} as const;

/** Fetches the image as a blob and triggers a real save-to-device
 *  download, on desktop and mobile alike. A plain <a href download>
 *  doesn't reliably force a download for a cross-origin URL (which a
 *  Supabase signed URL always is) — most browsers just navigate to it
 *  instead. Fetching the bytes first and downloading from a same
 *  -origin blob: URL is the part that actually makes `download` work. */
async function downloadPhoto(url: string, filename: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}

export function PhotoGallery({ supabase, lang }: { supabase: SupabaseClient; lang: Lang }) {
  const s = (key: keyof typeof strings) => strings[key][lang];
  const [photos, setPhotos] = useState<PhotoWithUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<PhotoWithUrl | null>(null);
  const [downloadState, setDownloadState] = useState<'idle' | 'busy' | 'error'>('idle');
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

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active]);

  const handleDelete = async (photo: PhotoWithUrl) => {
    await supabase.storage.from(BUCKET).remove([photo.storage_path]);
    await supabase.from('photo_uploads').delete().eq('id', photo.id);
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    if (active?.id === photo.id) setActive(null);
  };

  const handleDownload = async (photo: PhotoWithUrl) => {
    if (!photo.url || downloadState === 'busy') return;
    setDownloadState('busy');
    try {
      const ext = photo.storage_path.split('.').pop() ?? 'jpg';
      const namePart = (photo.guest_name || 'guest').replace(/[^\p{L}\p{N}]+/gu, '-');
      await downloadPhoto(photo.url, `${namePart}-${photo.id.slice(0, 8)}.${ext}`);
      setDownloadState('idle');
    } catch (err) {
      console.error('[admin] photo download failed:', err);
      setDownloadState('error');
    }
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
              {photo.url && (
                <button
                  type="button"
                  className="admin__photo-open"
                  onClick={() => {
                    setDownloadState('idle');
                    setActive(photo);
                  }}
                >
                  <img src={photo.url} alt="" loading="lazy" />
                </button>
              )}
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

      {active && (
        <div className="admin__lightbox" role="dialog" aria-modal="true">
          <div className="admin__lightbox-backdrop" onClick={() => setActive(null)} />
          <div className="admin__lightbox-panel">
            <button
              type="button"
              className="admin__lightbox-close"
              onClick={() => setActive(null)}
              aria-label={s('close')}
            >
              ×
            </button>
            {active.url && <img src={active.url} alt="" className="admin__lightbox-img" />}
            <div className="admin__lightbox-actions">
              <span className="admin__lightbox-name">
                {active.guest_name || s('unknownGuest')}
              </span>
              <button
                type="button"
                className="admin__button"
                onClick={() => void handleDownload(active)}
                disabled={downloadState === 'busy'}
              >
                {downloadState === 'busy' ? s('downloading') : s('download')}
              </button>
            </div>
            {downloadState === 'error' && (
              <p className="admin__lightbox-error">{s('downloadFailed')}</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
