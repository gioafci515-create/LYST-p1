# Wedding Invitation Site — Build Playbook

This document exists so the next site like this one doesn't have to
rediscover everything the hard way. It has three parts:

1. **What this project is** and how it's put together
2. **Every real bug that was found**, with root cause and fix — this is
   the part worth reading before you build the next one
3. **A reusable prompt** to hand a fresh Claude session to kick off a
   similar build with all of this baked in from day one

---

## 1. What this project is

A trilingual (Georgian / Russian / English) digital wedding invitation:
an envelope-opening landing sequence, a scrollable invitation with
photo sections, a wedding-details modal, a dress-code modal, an RSVP
form, a guest photo-upload feature, a live countdown, and a password
-protected admin dashboard — all backed by Supabase, deployed on
Vercel, built with Vite + React + TypeScript and plain CSS (no UI
framework, no CSS-in-JS).

Georgian is the primary/default language. This mattered more than it
sounds — see the Georgian-specific bugs below.

### Stack

| Layer | Choice | Why |
|---|---|---|
| Build | Vite + React 18 + TypeScript | fast, simple, no framework overhead for a mostly-static site |
| Styling | Plain CSS, one file per component | no build-step dependency, easy to reason about cascade issues (which came up a lot — see below) |
| Backend | Supabase (Postgres + Auth + Storage) | free tier is enough for a wedding; RLS gives real security without writing a server |
| Hosting | Vercel | auto-deploy from GitHub push, generous free tier, built-in analytics |
| Testing | Playwright | real browser E2E across a viewport × language matrix |
| i18n | Hand-rolled `translations.ts` dictionary + React Context | no need for a full i18n library at this scale |

### Architecture

- **State machine, not routes, for the main flow**: `sealed → opening →
  revealed`. The envelope gate and the scrollable invitation are two
  different top-level components swapped by a single piece of state,
  not by navigation.
- **Hash-based routing for the one real route** (`#/admin`) — a static
  host never 404s on a hash fragment, no server rewrite rules needed.
- **One shared reveal engine**, not per-component scroll listeners: a
  single `IntersectionObserver` watches every element carrying a
  `data-reveal` attribute (`rise` / `scale` / `blur` / `fade` / `mask`)
  and adds `.is-revealed` once. Motion tokens (durations, easings,
  stagger) live in one CSS file as custom properties. Scroll-linked
  drift uses native `animation-timeline: view()` where supported, with
  one shared `requestAnimationFrame` loop as the fallback — never one
  listener per element.
- **RLS is the actual security boundary, not the UI.** Every table:
  the anon key can `INSERT` and nothing else; only an authenticated
  (admin) session can `SELECT`/`DELETE`. The admin login is Supabase
  Auth email/password, created once by hand in the Supabase dashboard —
  **there is no public sign-up route, ever.** The admin page itself is
  just a convenient client for data that's already locked down
  server-side; assume the client-side gate can be bypassed and design
  the database policies as if it will be.
- **Client-side image compression before upload** (canvas resize +
  JPEG re-encode) — phone photos are 10–20MB raw; without this a
  free-tier storage bucket fills up fast.
- **Error boundaries around anything that must never silently
  disappear** (the countdown, in this case). Without one, an uncaught
  render error anywhere unmounts silently — the user just sees the
  thing go blank with no signal of why.

---

## 2. Every real bug found — root cause and fix

These are listed because most of them are **not obvious from testing
in a normal desktop browser**, and several were reported by the client
as "it's broken" long before the actual mechanism was found. If you're
building something similar, read this list *before* you write the
reveal engine / RSVP form / photo upload, not after.

### Bug 1 — CSS equal-specificity cascade ties resolve unpredictably
Two selectors with mathematically identical specificity (e.g.
`[data-reveal].is-revealed` vs `.some-button.is-revealed`) should be
decided by source order, but which file's CSS ends up later in the
bundle isn't always intuitive once you have many component CSS files.
This bit: a button's hover-grow effect, a hairline's reveal animation,
a decor layer's opacity. **Fix that was reliable every single time:**
add `!important` to the more-specific *intended* rule. Don't spend
time trying to out-clever the cascade — just force it.

### Bug 2 — `filter` + an animating `transform` on the same DOM node → boxy shadow on iOS Safari
A wax seal had `filter: drop-shadow(...)` and a hover/reveal
`transform: scale(...)` on the *same* element. On iOS Safari
specifically, this combination sometimes gets rasterized against the
element's rectangular layer bounds instead of its true alpha
silhouette — you get a visible box around the shape instead of a
shadow that follows its outline. Same root cause showed up twice: once
on a `filter`, once on a `radial-gradient` background used as a glow.
**Fix:** never let one element own both properties. Split into an
outer node that holds the static `filter`/gradient and never
transforms, and an inner child that owns the transform and holds
nothing visual of its own.

### Bug 3 — a React list `key` built from a translated string breaks scroll-reveal forever, only after a language switch
The countdown's four unit `<div>`s used `key={t('days')}` etc. Switch
language → the label text changes → React sees a *different* key →
unmounts the old node, mounts a new one. The new node carries
`data-reveal="rise"` and starts at `opacity: 0` (correct — that's the
reveal-ready gate), but the reveal engine's `IntersectionObserver` only
ever scanned elements that existed at initial page load. It never sees
this freshly-created replacement, so `.is-revealed` never gets added,
and the element is invisible **permanently**, including through
further language switches (each one repeats the process with fresh,
still-unobserved nodes).

This is the single most disruptive bug in the whole build because it
was **impossible to catch with textContent-based testing** — the
correct digits were always in the DOM, just at `opacity: 0`. Every
automated check that read `.textContent` or the *container's* computed
opacity (rather than the individual child elements' own opacity)
passed cleanly while the real guest-facing site was broken.

**Fix:** never key a list item on a translated/locale-dependent value.
Use a stable, language-independent key (`'days'`, not `t('days')`).
**Lesson for future testing:** when verifying a reveal/animation
system, check the opacity of the *actual leaf elements*, not a parent
container — a container's opacity can be perfectly fine while its
children are each individually stuck hidden.

### Bug 4 — inline React `style` opacity permanently defeats a stylesheet override
Decorative pieces had `style={{ opacity: 0.65 }}` set directly by
React (their intended resting opacity). No stylesheet rule can ever
override an inline style for the same property (short of
`!important` on the *inline* style itself, which isn't how React
inline styles work) — so `.is-revealed { opacity: 1 }` silently did
nothing, and these pieces were frozen at 0.65 opacity from the very
first frame, never actually participating in the reveal system at all.
**Fix:** move the intended value into a CSS custom property
(`style={{ '--target-opacity': 0.65 }}`) and reference it from the
reveal rule: `.is-revealed { opacity: var(--target-opacity, 1)
!important; }`.

### Bug 5 — missing env vars → the app's own graceful fallback silently threw away real user data
When Supabase env vars aren't configured, the app's RSVP-submit
function was written to fall back to a mock transport (log to
console, resolve after 800ms) — a reasonable default *for local
development*. In production, with the env vars never actually applied
to a build, guests who submitted the RSVP form saw a genuine "thank
you, received!" success screen while their response went nowhere.
Nobody could tell until the admin dashboard was checked and showed
zero rows despite guests insisting they'd RSVP'd.

**Lesson:** a graceful "no backend configured" fallback is correct for
*development*, but a **"success" state shown to a real user must be
backed by a verified write** — never let a missing-config code path
produce the same success UI as a genuine save, especially for
one-shot, non-recoverable user input like an RSVP. If you must keep a
dev fallback, make its success state visually/behaviorally distinct,
or better, make the app refuse to claim success if it can't actually
persist the data.

### Bug 6 — Vite env vars are baked in at *build* time, not read at runtime
Adding or fixing a `VITE_*` variable in Vercel's dashboard does
**nothing** to an already-built deployment — it only takes effect on
the *next* build. Combined with Bug 5, this meant the site could look
"fixed" in the dashboard while still serving the old broken behavior
until a fresh deploy actually ran.
**Verification technique that actually proved it, when the dashboard's
own "configured" checkmark couldn't be trusted:** fetch the live JS
bundle directly and grep it for the literal expected value (e.g. the
Supabase project URL string). If it's not baked into the bundle text,
the build never saw the env var, full stop — no amount of dashboard
confidence substitutes for this check.

### Bug 7 — Vercel "Secret"-type env vars are write-only, which hid a real misconfiguration
A Secret-type variable can't be viewed again after saving. When a
value turned out to be wrong, there was no way to *look* and confirm —
only delete-and-recreate. **Fix/practice:** for values that aren't
actually sensitive by nature (a Supabase anon key is meant to end up
public in the browser bundle anyway, protected by RLS not secrecy),
use Vercel's "Config" type instead of "Secret" so it stays inspectable
for future debugging.

### Bug 8 — `capture="environment"` on a file input removes the guest's choice
A single `<input type="file" accept="image/*" capture="environment">`
does not reliably show a "camera or gallery" chooser — on many mobile
browsers it jumps straight into the camera, skipping the gallery
option entirely. Guests who wanted to share an existing photo couldn't.
**Fix:** use two separate inputs/buttons — one with `capture`
("Take a photo"), one without ("Choose from gallery") — each appending
to the same selected-files array, rather than relying on ambiguous
native chooser behavior that varies by OS/browser.

### Bug 9 — `object-fit: cover` crops hard when the box's aspect ratio drifts from the image's
A wide, pre-composed decorative image was placed with `object-fit:
cover` behind a text section. On mobile the section is roughly
square-ish and it looked fine; on a wide desktop viewport the *same
section* becomes very wide and short (its height is driven by text
content, not viewport width), while the image stays landscape —
`cover` scaled to fill the box's width and cropped the top and bottom
off almost entirely. **Fix:** use `object-fit: contain` for any
decorative image where "always show the whole thing" matters more than
"always fill the box exactly" — it letterboxes instead of cropping,
which is invisible anyway on a transparent-background decorative PNG.

### Bug 10 — HEIC photos from iPhones can silently fail client-side compression
Client-side compression (`createImageBitmap` → canvas → re-encode as
JPEG) can fail to decode HEIC, the default format iPhones save
camera-roll photos in, on some mobile browser engines. If that failure
isn't caught, the guest's photo is silently dropped from the upload
batch. **Fix:** wrap compression in try/catch; on failure, upload the
**original, uncompressed file** rather than giving up on it. Losing
the file-size optimization is a much smaller problem than losing the
guest's photo.

### Bug 11 — a real user's browser cache can perfectly mimic a code bug
After a fix was deployed *and independently verified* by fetching the
live bundle server-side and confirming the fix was present in it, the
person testing on their own regular browser (not incognito) still saw
the old broken behavior — because their browser was serving a cached
copy of the old JS bundle. It worked immediately in a private/
incognito window. **Lesson:** before spending more debugging time on
a "the fix isn't working" report, first rule out cache with a private
window — this is often faster than it feels like it should be to
check, and it's a very common false alarm.

### Bug 12 — rebuilding the app while a test suite is reading from that same build corrupts the results
Running `npm run build` (which deletes and regenerates `dist/`) while
a Playwright suite is still executing against a preview server serving
that same `dist/` folder produces a wave of confusing, unrelated-
looking failures (stale asset-hash 404s, "waiting for locator" 
timeouts) that look like real regressions but are purely a race
against yourself. **Practice:** never edit code or rebuild while a
verification run you intend to trust the result of is still in flight;
if you must keep working, treat that run's result as void rather than
investigating its failures as real.

### Bug 13 — Georgian display-font glyphs get clipped by an overflow-hidden text-reveal mask
A line-mask scroll-reveal technique (`overflow: hidden` on a wrapper,
the text itself translated up from below) is standard and worked fine
for Latin and Cyrillic text. For Georgian specifically, the custom
display webfont's glyph ink (particularly on letters with descenders)
extends further below the baseline than the line-height box accounted
for, so the mask clipped the bottom off Georgian headings — invisible
for the other two languages in the same UI, real and visible only for
Georgian. **Fix:** either raise line-height specifically for that
language/font (`html[lang="ka"] { line-height: 1.4; }`), or add a
small `padding-bottom` to the masking element with an equal negative
`margin-bottom` to enlarge the clip window without shifting layout —
the latter is more robust since it doesn't depend on guessing the
right line-height multiplier for an unfamiliar font's real metrics.

---

## 3. Design decisions that worked (worth repeating)

- A dark, saturated, specific palette (olive/forest greens + a warm
  lace/bone cream + one gold accent) read as far more intentional than
  a generic "elegant wedding" template look. Naming every color as a
  CSS custom property up front (`--olive`, `--forest`, `--lace`, etc.)
  made every later "make X match the palette" request trivial.
- Pairing a Latin/Cyrillic display face with a *separate* Georgian
  display face (because the originally-referenced font had no Unicode
  Georgian coverage at all) was necessary, not optional, for a
  Georgian-first trilingual site. Check font language coverage before
  committing to a typeface, not after.
- A single shared reveal engine + a small, fixed vocabulary of motion
  tokens made every new section's entrance animation nearly free to
  add correctly, and made the one performance budget easy to reason
  about (one observer, one rAF loop, capped tracked-element count).
- Reusing already-loaded real content images as background decor (a
  couple's own photos, faded and layered) reads as more intentional
  and costs zero extra network weight, versus commissioning or
  generating new generic decorative assets.
- Building the photo-upload feature with the *exact same* security
  model, form structure, and visual language as the already-working
  RSVP flow (rather than inventing something new) meant it needed far
  less design iteration and no new bug classes.

---

## 4. Testing discipline that mattered

- **Matrix, not spot checks**: every full guest-flow test ran across 4
  viewports (320/390/768/1280) × 3 languages = 12 runs, plus a
  dedicated hover-affordance check, on every verification pass.
  Language-specific bugs (Bug 13) and viewport-specific bugs (Bug 9)
  were *only* caught because the matrix existed — a single-viewport,
  single-language smoke test would have missed both.
- **Check leaf elements' actual computed style, not just DOM presence
  or a parent's style** (see Bug 3) — `textContent` being correct and
  a container's `opacity` being `1` are not proof that the thing a
  user actually looks at is visible.
- **Allowlist known-benign noise explicitly, don't just relax the
  assertion.** Analytics scripts 404 in local/preview environments by
  design (they only resolve on a real platform deployment); the test
  suite explicitly filtered *those specific URLs* out of its
  zero-console-errors check rather than loosening the check generally
  — so a real new error still fails the suite.
- **A failing test run that overlapped a rebuild is not evidence of
  anything** (Bug 12) — always re-run clean before trusting a result,
  especially before reporting "still broken" or "fixed" to anyone.
- Before declaring a live bug fixed, fetch the *actual deployed*
  bundle/page and prove it, rather than trusting that a push happened,
  a deployment shows "Ready," or a dashboard checkbox is checked (Bugs
  6, 7, 11 all defeated "should be fine" reasoning specifically).

---

## 5. Pre-launch checklist for a site like this

- [ ] Supabase: run every one-time SQL file (schema, storage buckets,
      RLS policies) in the SQL editor — these are not automatic
      migrations, they must be run by hand once per project
- [ ] Supabase: create the admin user by hand in Authentication → Users
      (never build a public sign-up route)
- [ ] Vercel: set every `VITE_*` env var (Config type unless the value
      is genuinely secret), scoped to Production *and* Preview
- [ ] Vercel: trigger a fresh deployment *after* env vars are set —
      confirm by fetching the live bundle and grepping for an expected
      baked-in value
- [ ] Confirm RLS policies actually lock down every table — the anon
      key should be able to insert and nothing else; test as an
      unauthenticated request, not just "the admin UI works"
- [ ] Run the full viewport × language test matrix, clean, with no
      concurrent rebuilds
- [ ] Test the actual live URL, not just localhost — several of the
      real bugs above only existed there
- [ ] Test in a private/incognito window before concluding a deployed
      fix doesn't work
- [ ] og:image / og:url / twitter:card use **absolute** URLs, not
      relative paths, or link previews break everywhere it's shared
- [ ] Every image asset that will be publicly loaded is reasonably
      compressed — a handful of unoptimized multi-megabyte PNGs is
      enough to produce 10+ second load times under real mobile
      network throttling, even with otherwise-fine code

---

## 6. Reusable kickoff prompt

Copy everything below into a fresh session to start a similar build
with all of the above baked in from the start, instead of
rediscovering it.

> I'm building a [language(s)] digital wedding/event invitation site.
> Stack: Vite + React + TypeScript, plain CSS per component (no
> Tailwind/CSS-in-JS), Supabase for backend (Postgres + Auth +
> Storage), deployed on Vercel. Use React Context + a plain
> `translations.ts` dictionary for i18n rather than a library, unless
> the language count grows past 3-4.
>
> Architecture rules to follow from the start, not retrofit later:
>
> - RLS is the real security boundary on every table: anon key gets
>   INSERT-only policies, an authenticated (admin) session gets
>   SELECT/DELETE. No public sign-up route ever — the one admin account
>   is created by hand in the Supabase dashboard. Treat the admin UI as
>   a convenience layer only, never the actual lock.
> - Any client-side "no backend configured" fallback must never render
>   the same success state as a real, verified write — especially for
>   one-shot user input like an RSVP. A guest must never see "thank
>   you, received" for data that didn't actually save.
> - Build one shared scroll-reveal engine (single `IntersectionObserver`,
>   a small fixed vocabulary of `data-reveal` types, motion tokens as
>   CSS custom properties in one file) rather than per-component
>   listeners. Never key a reveal-tracked list item on a translated or
>   otherwise locale-dependent string — use a stable id, or a language
>   switch will permanently break that element's reveal.
> - Never let one element own both `filter` and an animating
>   `transform`/gradient at the same time — split into a static outer
>   node (filter) and an animating inner node, or expect a boxy-shadow
>   artifact on iOS Safari.
> - Any inline React `style` value that a reveal/animation system needs
>   to override must be exposed as a CSS custom property first — an
>   inline style always beats a stylesheet rule.
> - Prefer `object-fit: contain` over `cover` for any decorative image
>   whose box's aspect ratio isn't guaranteed to match the image
>   (basically any image that sits behind flowing text content).
> - Guest photo/file upload: compress client-side before upload (canvas
>   resize + re-encode), but wrap compression in try/catch and fall
>   back to uploading the original file on failure — HEIC from iPhones
>   is a common real-world decode failure, and losing the guest's photo
>   is worse than losing the compression.
> - For any "take a photo or choose one" upload control, use two
>   separate file inputs (one with `capture`, one without) rather than
>   relying on native chooser behavior with a single input — it's
>   inconsistent across mobile OS/browser combinations.
> - If any target language's display font is different from the site's
>   primary font (check Unicode coverage before committing to a
>   typeface), watch for glyph clipping in any `overflow: hidden`
>   text-reveal mask — that language's line-height may need to be
>   larger specifically, or add a small padding buffer to the mask.
> - Absolute URLs (not relative) for every `og:` and `twitter:` meta
>   tag, or link previews break wherever the site is shared.
>
> Testing discipline:
>
> - Test across a real viewport × language matrix, not one
>   combination — several real bugs in a prior build like this only
>   existed at specific viewport/language combinations.
> - When checking whether a reveal/animation completed, check the
>   actual leaf element's computed opacity/transform, not a parent
>   container's — a container can look fine while its children are
>   each individually stuck.
> - Never trust a test run that overlapped a rebuild or file edit;
>   re-run clean before reporting a result.
> - Vite `VITE_*` env vars are baked in at build time. After setting or
>   fixing one on the host (Vercel/etc.), a fresh build must happen
>   before it takes effect — verify by fetching the live bundle and
>   confirming the expected value is actually present in it, don't
>   trust the dashboard alone.
> - Before concluding a deployed fix "isn't working," rule out the
>   reporter's own browser cache with a private/incognito window first.
>
> Design: [describe palette, typography, and the one signature visual
> element you want the whole site remembered by]. Ground every visual
> choice in real content (the couple's actual photos, actual venue,
> actual colors) rather than generic stock wedding-site elements.

---

*Written after building this project end-to-end: envelope-opening
state machine, trilingual support, scroll-choreographed reveals,
Supabase-backed RSVP with an authenticated admin dashboard, and a
guest photo-upload feature, plus every bug listed above found and
fixed along the way.*
