import { useMemo, useState } from 'react';
import type { Lang } from '../../data/translations';

export interface RsvpRow {
  id: string;
  first_name: string;
  last_name: string;
  attendance: 'attending' | 'not-attending';
  guest_count: number;
  message: string | null;
  language: string;
  created_at: string;
}

type SortKey = 'name' | 'status' | 'guests' | 'language' | 'submitted';
type Filter = 'all' | 'attending' | 'not-attending';

const strings = {
  name: { ka: 'სახელი', ru: 'Имя', en: 'Name' },
  status: { ka: 'სტატუსი', ru: 'Статус', en: 'Status' },
  guests: { ka: 'სტუმრები', ru: 'Гости', en: 'Guests' },
  language: { ka: 'ენა', ru: 'Язык', en: 'Language' },
  message: { ka: 'შეტყობინება', ru: 'Сообщение', en: 'Message' },
  submitted: { ka: 'გაგზავნილი', ru: 'Отправлено', en: 'Submitted' },
  search: { ka: 'ძებნა', ru: 'Поиск', en: 'Search' },
  all: { ka: 'ყველა', ru: 'Все', en: 'All' },
  attending: { ka: 'დაესწრება', ru: 'Будут', en: 'Attending' },
  notAttending: { ka: 'ვერ', ru: 'Не будут', en: 'Not attending' },
  empty: { ka: 'პასუხები ჯერ არ არის', ru: 'Ответов пока нет', en: 'No responses yet' },
  yes: { ka: 'დაესწრება', ru: 'Будет', en: 'Attending' },
  no: { ka: 'ვერ დაესწრება', ru: 'Не будет', en: 'Not attending' },
  more: { ka: 'სრულად', ru: 'Показать', en: 'Show all' },
} as const;

export function GuestTable({
  rows,
  lang,
  loading,
}: {
  rows: RsvpRow[];
  lang: Lang;
  loading: boolean;
}) {
  const s = (key: keyof typeof strings) => strings[key][lang];
  const [sortKey, setSortKey] = useState<SortKey>('submitted');
  const [sortAsc, setSortAsc] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows;
    if (filter !== 'all') list = list.filter((r) => r.attendance === filter);
    if (q) {
      list = list.filter((r) =>
        `${r.first_name} ${r.last_name} ${r.message ?? ''}`.toLowerCase().includes(q),
      );
    }
    const dir = sortAsc ? 1 : -1;
    return [...list].sort((a, b) => {
      switch (sortKey) {
        case 'name':
          return dir * `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        case 'status':
          return dir * a.attendance.localeCompare(b.attendance);
        case 'guests':
          return dir * (a.guest_count - b.guest_count);
        case 'language':
          return dir * a.language.localeCompare(b.language);
        default:
          return dir * a.created_at.localeCompare(b.created_at);
      }
    });
  }, [rows, query, filter, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(key === 'name');
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const headers: { key: SortKey; label: string }[] = [
    { key: 'name', label: s('name') },
    { key: 'status', label: s('status') },
    { key: 'guests', label: s('guests') },
    { key: 'language', label: s('language') },
    { key: 'submitted', label: s('submitted') },
  ];

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: s('all') },
    { key: 'attending', label: s('attending') },
    { key: 'not-attending', label: s('notAttending') },
  ];

  return (
    <section className="admin__table-section">
      <div className="admin__table-controls">
        <input
          type="search"
          className="admin__search"
          placeholder={s('search')}
          aria-label={s('search')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="admin__chips" role="group">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`admin__chip${filter === f.key ? ' is-active' : ''}`}
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {!loading && rows.length === 0 ? (
        <p className="admin__empty">{s('empty')}</p>
      ) : (
        <div className="admin__table-scroll">
          <table className="admin__table">
            <thead>
              <tr>
                {headers.map((h) => (
                  <th key={h.key} scope="col">
                    <button type="button" className="admin__th" onClick={() => toggleSort(h.key)}>
                      {h.label}
                      {sortKey === h.key && <span aria-hidden="true">{sortAsc ? ' ↑' : ' ↓'}</span>}
                    </button>
                  </th>
                ))}
                <th scope="col">{s('message')}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id}>
                  <td>
                    {r.first_name} {r.last_name}
                  </td>
                  <td className={r.attendance === 'attending' ? 'admin__cell-yes' : 'admin__cell-no'}>
                    {r.attendance === 'attending' ? s('yes') : s('no')}
                  </td>
                  <td className="admin__cell-num">{r.guest_count}</td>
                  <td>{r.language.toUpperCase()}</td>
                  <td className="admin__cell-date">
                    {new Date(r.created_at).toLocaleDateString(
                      lang === 'ka' ? 'ka-GE' : lang === 'ru' ? 'ru-RU' : 'en-GB',
                      {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="admin__cell-message">
                    {r.message && (
                      <>
                        <span className={expanded.has(r.id) ? '' : 'admin__clamp'}>{r.message}</span>
                        {r.message.length > 80 && !expanded.has(r.id) && (
                          <button
                            type="button"
                            className="admin__expand"
                            onClick={() => toggleExpand(r.id)}
                          >
                            {s('more')}
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
