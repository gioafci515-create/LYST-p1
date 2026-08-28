import { getSupabaseAsync, hasSupabaseEnv } from './supabase';

export type Attendance = 'attending' | 'not-attending';

export interface RsvpData {
  firstName: string;
  lastName: string;
  attendance: Attendance | null;
  guestCount: number;
  message: string;
  language: string;
}

export interface StoredRsvp {
  sentAt: string;
  attendance: Attendance;
}

const STORAGE_KEY = 'invite-rsvp';

/**
 * Transport adapter, in priority order:
 *  1. Supabase insert (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY set)
 *  2. Formspree POST (VITE_RSVP_ENDPOINT set)
 *  3. Mock: log the payload, resolve after 800ms — testable without a backend
 *
 * Google Apps Script alternative — deploy a web app appending to a sheet:
 *
 *   await fetch('https://script.google.com/macros/s/<DEPLOY_ID>/exec', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'text/plain;charset=utf-8' },
 *     body: JSON.stringify(data),
 *   });
 */
export async function submitRsvp(data: RsvpData): Promise<void> {
  const supabase = hasSupabaseEnv() ? await getSupabaseAsync() : null;
  if (supabase) {
    const { error } = await supabase.from('rsvps').insert({
      first_name: data.firstName,
      last_name: data.lastName,
      attendance: data.attendance,
      guest_count: data.attendance === 'attending' ? data.guestCount : 1,
      message: data.message || null,
      language: data.language,
    });
    if (error) throw new Error(`RSVP insert failed: ${error.message}`);
    return;
  }

  const endpoint = import.meta.env.VITE_RSVP_ENDPOINT as string | undefined;
  if (endpoint) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`RSVP submit failed: ${response.status}`);
    }
    return;
  }

  console.info('[rsvp] no backend configured, payload:', data);
  await new Promise((resolve) => setTimeout(resolve, 800));
}

export function readStoredRsvp(): StoredRsvp | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredRsvp;
    if (parsed && typeof parsed.sentAt === 'string') return parsed;
  } catch {
    /* storage unavailable or corrupt */
  }
  return null;
}

export function storeRsvp(attendance: Attendance): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ sentAt: new Date().toISOString(), attendance }),
    );
  } catch {
    /* storage unavailable */
  }
}

export function clearStoredRsvp(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}
