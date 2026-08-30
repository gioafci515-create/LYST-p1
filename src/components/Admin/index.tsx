import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAsync, hasSupabaseEnv } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';
import type { Lang } from '../../data/translations';
import { Chart } from './Chart';
import { GuestTable, type RsvpRow } from './GuestTable';
import { PhotoGallery } from './PhotoGallery';
import './Admin.css';

type LoadState = 'loading' | 'ready' | 'error';

const strings = {
  signIn: { ka: 'შესვლა', ru: 'Вход', en: 'Sign in' },
  email: { ka: 'ელფოსტა', ru: 'Эл. почта', en: 'Email' },
  password: { ka: 'პაროლი', ru: 'Пароль', en: 'Password' },
  badCredentials: {
    ka: 'არასწორი ელფოსტა ან პაროლი',
    ru: 'Неверная почта или пароль',
    en: 'Wrong email or password',
  },
  signOut: { ka: 'გასვლა', ru: 'Выйти', en: 'Sign out' },
  totalResponses: { ka: 'პასუხები', ru: 'Ответы', en: 'Responses' },
  attending: { ka: 'დაესწრება', ru: 'Будут', en: 'Attending' },
  notAttending: { ka: 'ვერ დაესწრება', ru: 'Не будут', en: 'Not attending' },
  headcount: { ka: 'სტუმრები სულ', ru: 'Всего гостей', en: 'Total headcount' },
  opens: { ka: 'გახსნები', ru: 'Открытия', en: 'Opens' },
  responseRate: { ka: 'პასუხის მაჩვენებელი', ru: 'Доля ответов', en: 'Response rate' },
  overTime: { ka: 'პასუხები დროში', ru: 'Ответы по дням', en: 'Responses over time' },
  refresh: { ka: 'განახლება', ru: 'Обновить', en: 'Refresh' },
  updated: { ka: 'განახლდა', ru: 'обновлено', en: 'updated' },
  exportCsv: { ka: 'CSV ექსპორტი', ru: 'Экспорт CSV', en: 'Export CSV' },
  loadFailed: {
    ka: 'მონაცემები ვერ ჩაიტვირთა',
    ru: 'Не удалось загрузить данные',
    en: "Couldn't load data",
  },
  retry: { ka: 'ხელახლა ცდა', ru: 'Повторить', en: 'Retry' },
} as const;

type S = (key: keyof typeof strings) => string;

/**
 * #/admin — magic-link auth + guest dashboard. The anon key cannot SELECT;
 * row-level security is the actual lock, this UI is convenience.
 */
export function AdminPage() {
  const { lang } = useLanguage();
  const s = useCallback<S>((key) => strings[key][lang], [lang]);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // noindex while the admin route is mounted
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      setAuthReady(true);
      return;
    }
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    void getSupabaseAsync().then((client) => {
      if (cancelled || !client) return;
      setSupabase(client);
      client.auth.getSession().then(({ data }) => {
        setSession(data.session);
        setAuthReady(true);
      });
      const { data: sub } = client.auth.onAuthStateChange((_event, next) => {
        setSession(next);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  if (!hasSupabaseEnv()) {
    return (
      <main className="admin admin--login">
        <p className="admin__note">
          Supabase is not configured. Set <code>VITE_SUPABASE_URL</code> and{' '}
          <code>VITE_SUPABASE_ANON_KEY</code>, then run{' '}
          <code>supabase/schema.sql</code> in the SQL editor.
        </p>
      </main>
    );
  }

  if (!authReady || !supabase) return <main className="admin admin--login" />;

  if (!session) return <Login s={s} supabase={supabase} />;

  return (
    <Dashboard
      s={s}
      lang={lang}
      supabase={supabase}
      onSignOut={() => supabase.auth.signOut()}
    />
  );
}

/**
 * Password login against the admin user created in the Supabase dashboard.
 * There is deliberately no sign-up path anywhere in the app.
 */
function Login({ s, supabase }: { s: S; supabase: SupabaseClient }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || busy) return;
    setBusy(true);
    setFailed(false);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setFailed(true);
    // success: onAuthStateChange flips the page to the dashboard
  };

  return (
    <main className="admin admin--login">
      <form className="admin__login-form" onSubmit={submit}>
        <label className="admin__label" htmlFor="admin-email">
          {s('email')}
        </label>
        <input
          id="admin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <label className="admin__label" htmlFor="admin-password">
          {s('password')}
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        {failed && <p className="admin__login-error">{s('badCredentials')}</p>}
        <button type="submit" className="admin__button" disabled={busy}>
          {s('signIn')}
        </button>
      </form>
    </main>
  );
}

interface DashboardProps {
  s: S;
  lang: Lang;
  supabase: SupabaseClient;
  onSignOut: () => void;
}

function Dashboard({ s, lang, supabase, onSignOut }: DashboardProps) {
  const [rows, setRows] = useState<RsvpRow[]>([]);
  const [opens, setOpens] = useState(0);
  const [state, setState] = useState<LoadState>('loading');
  const [errorDetail, setErrorDetail] = useState('');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    setState('loading');
    const [rsvpRes, opensRes] = await Promise.all([
      supabase.from('rsvps').select('*').order('created_at', { ascending: false }),
      supabase.from('invitation_opens').select('*', { count: 'exact', head: true }),
    ]);
    if (!mountedRef.current) return;
    if (rsvpRes.error || opensRes.error) {
      setErrorDetail(rsvpRes.error?.message ?? opensRes.error?.message ?? '');
      setState('error');
      return;
    }
    setRows((rsvpRes.data ?? []) as RsvpRow[]);
    setOpens(opensRes.count ?? 0);
    setUpdatedAt(new Date());
    setState('ready');
  }, [supabase]);

  useEffect(() => {
    mountedRef.current = true;
    void load();
    const channel = supabase
      .channel('rsvps-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'rsvps' },
        (payload) => {
          setRows((prev) => [payload.new as RsvpRow, ...prev]);
          setUpdatedAt(new Date());
        },
      )
      .subscribe();
    return () => {
      mountedRef.current = false;
      void supabase.removeChannel(channel);
    };
  }, [supabase, load]);

  const stats = useMemo(() => {
    const attending = rows.filter((r) => r.attendance === 'attending');
    const notAttending = rows.length - attending.length;
    const headcount = attending.reduce((sum, r) => sum + (r.guest_count || 1), 0);
    const rate = opens > 0 ? Math.round((rows.length / opens) * 100) : null;
    return { attending: attending.length, notAttending, headcount, rate };
  }, [rows, opens]);

  const chartPoints = useMemo(() => {
    const byDay = new Map<string, number>();
    [...rows]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .forEach((r) => {
        const day = r.created_at.slice(0, 10);
        byDay.set(day, (byDay.get(day) ?? 0) + 1);
      });
    let cumulative = 0;
    return Array.from(byDay.entries()).map(([date, count]) => {
      cumulative += count;
      return { date, cumulative };
    });
  }, [rows]);

  const exportCsv = () => {
    const header = ['First name', 'Last name', 'Status', 'Guests', 'Language', 'Message', 'Submitted'];
    const quote = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = [
      header.map(quote).join(','),
      ...rows.map((r) =>
        [
          r.first_name,
          r.last_name,
          r.attendance,
          r.guest_count,
          r.language,
          r.message ?? '',
          r.created_at,
        ]
          .map(quote)
          .join(','),
      ),
    ];
    // UTF-8 BOM so Excel doesn't mangle Georgian
    const blob = new Blob(['﻿' + lines.join('\r\n')], {
      type: 'text/csv;charset=utf-8',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `guests-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const cards = [
    { key: 'total', label: s('totalResponses'), value: rows.length },
    { key: 'attending', label: s('attending'), value: stats.attending },
    { key: 'notAttending', label: s('notAttending'), value: stats.notAttending },
    { key: 'headcount', label: s('headcount'), value: stats.headcount },
    { key: 'opens', label: s('opens'), value: opens },
    { key: 'rate', label: s('responseRate'), value: stats.rate === null ? '—' : `${stats.rate}%` },
  ];

  return (
    <main className="admin">
      <header className="admin__header">
        <h1 className="admin__title">D · K</h1>
        <div className="admin__header-actions">
          {updatedAt && (
            <span className="admin__updated">
              {s('updated')}{' '}
              {updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button type="button" className="admin__button" onClick={() => void load()}>
            {s('refresh')}
          </button>
          <button type="button" className="admin__button" onClick={exportCsv} disabled={rows.length === 0}>
            {s('exportCsv')}
          </button>
          <button type="button" className="admin__button admin__button--quiet" onClick={onSignOut}>
            {s('signOut')}
          </button>
        </div>
      </header>

      {state === 'error' ? (
        <div className="admin__error">
          <p>
            {s('loadFailed')}
            {errorDetail && <code> — {errorDetail}</code>}
          </p>
          <button type="button" className="admin__button" onClick={() => void load()}>
            {s('retry')}
          </button>
        </div>
      ) : (
        <>
          <section className="admin__stats">
            {cards.map((card) => (
              <div key={card.key} className={`admin__card${state === 'loading' ? ' is-loading' : ''}`}>
                <span className="admin__card-value">{state === 'loading' ? '' : card.value}</span>
                <span className="admin__card-label">{card.label}</span>
              </div>
            ))}
          </section>

          <section className="admin__chart">
            <h2 className="admin__section-title">{s('overTime')}</h2>
            <Chart points={chartPoints} />
          </section>

          <GuestTable rows={rows} lang={lang} loading={state === 'loading'} />

          <PhotoGallery supabase={supabase} lang={lang} />
        </>
      )}
    </main>
  );
}
