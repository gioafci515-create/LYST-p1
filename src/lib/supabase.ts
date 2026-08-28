import type { SupabaseClient } from '@supabase/supabase-js';

let clientPromise: Promise<SupabaseClient | null> | undefined;

export function hasSupabaseEnv(): boolean {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
  );
}

/**
 * Lazily created Supabase client, or null when env vars are absent.
 * The SDK itself is dynamically imported so guests who never submit an
 * RSVP don't download it.
 */
export function getSupabaseAsync(): Promise<SupabaseClient | null> {
  if (!clientPromise) {
    clientPromise = (async () => {
      const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
      if (!url || !anonKey) return null;
      const { createClient } = await import('@supabase/supabase-js');
      return createClient(url, anonKey);
    })();
  }
  return clientPromise;
}

/**
 * One row per session on the envelope tap; a reload doesn't double-count.
 * The only tracking on the site.
 */
export function logInvitationOpen(language: string): void {
  if (!hasSupabaseEnv()) return;
  try {
    if (sessionStorage.getItem('invite-open-logged')) return;
    sessionStorage.setItem('invite-open-logged', '1');
  } catch {
    return; // no sessionStorage → skip rather than risk double-counting
  }
  void getSupabaseAsync().then((supabase) => {
    if (!supabase) return;
    return supabase
      .from('invitation_opens')
      .insert({ language, referrer: document.referrer || null })
      .then(({ error }) => {
        if (error) console.info('[opens] log failed:', error.message);
      });
  });
}
