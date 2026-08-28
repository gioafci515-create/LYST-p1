# დავითი & ქეთო — digital wedding invitation

Single-page envelope-opening invitation in Georgian and Russian. Vite + React 18 + TypeScript, plain CSS. Olive/lace/bone palette over a fixed gradient-plus-grain ground.

## Run

```bash
npm install
npm run dev       # local dev
npm run build     # type-check + production build to dist/
npm run preview   # serve dist/
npx playwright test   # 8-scenario verification matrix (4 viewports × ka/ru)
```

## Configure

- **All names, dates, venue, schedule, dress code:** `src/data/wedding.ts`
- **All UI strings (ka/ru):** `src/data/translations.ts`
- **RSVP backend** (priority order, see `src/lib/rsvp.ts`):
  1. **Supabase** — set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (copy `.env.example` → `.env`), run `supabase/schema.sql` in the SQL editor. Anon key can only INSERT; reading requires an authenticated session (row-level security).
  2. **Formspree** — set `VITE_RSVP_ENDPOINT`.
  3. Neither → payload logs to console, flow still testable.
- **Admin dashboard:** `#/admin` (hash route). Magic-link login via Supabase Auth — add the admin's email as a user in Supabase. Shows stats, cumulative-response chart, sortable/searchable guest table, CSV export (UTF-8 BOM), realtime updates. Renders a config notice until Supabase env vars exist. Never linked from the guest UI.
- **Photos:** replace `public/assets/photo-placeholder-{1,2}.svg` — see `public/assets/README.md`.
- **Music:** `public/assets/music.mp3` intentionally absent; the toggle hides until it exists.

## Fonts

Harvested from the reference site: `GL Erekles Stamba` (real Unicode Georgian, bundled at `src/fonts/`) carries Georgian display text. `Geo Tabidze` was rejected — legacy transliteration mapping, no Unicode Georgian. Cormorant Garamond / Great Vibes / Manrope / Noto Georgian families load from Google Fonts (async).

## Deploy to GitHub Pages

`vite.config.ts` uses `base: './'` — the built `dist/` works under any repo name.
