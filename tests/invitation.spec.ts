import { test, expect, type Page } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const PASS = process.env.VERIFY_PASS ?? '1';
const SHOT_DIR = path.join('test-results', 'screens', `pass-${PASS}`);
fs.mkdirSync(SHOT_DIR, { recursive: true });

const viewports = [
  { name: '320', width: 320, height: 568 },
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1280', width: 1280, height: 800 },
];
const langs = ['ka', 'ru', 'en'] as const;

const shot = (page: Page, vp: string, lang: string, label: string) =>
  page.screenshot({ path: path.join(SHOT_DIR, `${vp}-${lang}-${label}.png`) });

async function assertNoHorizontalOverflow(page: Page, context: string) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, `horizontal overflow at ${context}`).toBeLessThanOrEqual(0);
}

for (const vp of viewports) {
  for (const lang of langs) {
    test(`${vp.name}px ${lang}: full guest flow`, async ({ page }) => {
      // @vercel/analytics and @vercel/speed-insights fetch
      // /_vercel/insights/script.js and /_vercel/speed-insights/script.js,
      // which only exist on a real Vercel deployment. Locally (vite
      // preview/dev) they 404 — expected here, harmless in production.
      const KNOWN_LOCAL_404S = ['/_vercel/insights/', '/_vercel/speed-insights/'];
      const errors: string[] = [];
      // The browser's console text for a failed resource load is a generic
      // "Failed to load resource: ... 404" with no URL in it — can't be
      // matched against KNOWN_LOCAL_404S. The response listener below has
      // the real URL and is the sole source of truth for network failures;
      // this handler only needs to catch genuine JS errors/rejections.
      page.on('console', (msg) => {
        if (msg.type() !== 'error') return;
        const text = msg.text();
        if (text.startsWith('Failed to load resource')) return;
        errors.push(text);
      });
      page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
      page.on('response', (res) => {
        if (res.status() === 404 && KNOWN_LOCAL_404S.some((p) => res.url().includes(p))) return;
        if (res.status() >= 400) errors.push(`http ${res.status()}: ${res.url()}`);
      });

      await page.addInitScript((l) => {
        localStorage.setItem('invite-lang', l);
        localStorage.removeItem('invite-rsvp');
      }, lang);
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/', { waitUntil: 'networkidle' });

      // sealed
      await page.waitForSelector('.envelope');
      await shot(page, vp.name, lang, '01-sealed');
      await assertNoHorizontalOverflow(page, 'sealed');

      // language switcher must not wrap at 320
      const switcherHeight = await page
        .locator('.lang-switcher')
        .evaluate((el) => el.getBoundingClientRect().height);
      expect(switcherHeight, 'switcher wrapped').toBeLessThan(50);

      // open
      await page.click('.envelope', { force: true });
      await page.waitForTimeout(600);
      await shot(page, vp.name, lang, '02-opening');
      await page.waitForTimeout(1600);
      await shot(page, vp.name, lang, '03-revealed');
      await assertNoHorizontalOverflow(page, 'revealed');

      const bodyPosition = await page.evaluate(() => getComputedStyle(document.body).position);
      expect(bodyPosition).not.toBe('fixed');
      await page.evaluate(() => window.scrollTo(0, 200));
      await page.waitForTimeout(200);
      expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
      await page.evaluate(() => window.scrollTo(0, 0));

      // sections reveal — data-reveal engine, not the old .reveal class.
      // scrollIntoViewIfNeeded() alone can land an element right at the
      // edge of the -12% bottom rootMargin (barely intersecting, correctly
      // NOT yet fired); nudge with a real scroll continuation to match how
      // a guest actually arrives at a section, then give the longest
      // reveal (line-mask, --dur-slow + stagger) time to finish.
      const sections = [
        '.intro',
        '.photo-section >> nth=0',
        '.details-teaser',
        '.photo-section >> nth=1',
        '.rsvp-teaser',
        '.countdown',
        '.footer',
      ];
      for (const [i, selector] of sections.entries()) {
        await page.locator(selector).scrollIntoViewIfNeeded();
        await page.evaluate(() => window.scrollBy(0, 150));
        // longest reveal on the page: intro decor at up to 1140ms delay +
        // 1800ms (--dur-drift) duration = 2940ms; pad above that
        await page.waitForTimeout(3200);
        const stuck = await page.locator(selector).evaluate((el) => {
          const targets = el.matches('[data-reveal]')
            ? [el]
            : Array.from(el.querySelectorAll('[data-reveal]'));
          // "revealed" means opacity moved off its hidden 0 baseline —
          // not that it reached 1. Decor pieces intentionally settle at
          // their own design opacity (e.g. 0.55-0.65), never 1.
          return targets
            .filter((t) => Number(getComputedStyle(t).opacity) <= 0.02)
            .map((t) => t.className || t.tagName);
        });
        expect(stuck, `${selector} reveal stuck: ${JSON.stringify(stuck)}`).toEqual([]);
        await assertNoHorizontalOverflow(page, selector);
        if (i === 0 || i === 2 || i === 5) {
          await shot(page, vp.name, lang, `04-section-${i}`);
        }
      }

      // BackToTop: visible deep in the page, gone when a modal opens
      await page.locator('.countdown').scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await expect(page.locator('.back-to-top')).toBeVisible();

      // details modal
      const detailsBtn = page.locator('.details-teaser .paper-cta');
      await detailsBtn.scrollIntoViewIfNeeded();
      await detailsBtn.click();
      await page.waitForSelector('[role="dialog"]');
      await page.waitForTimeout(450);
      await shot(page, vp.name, lang, '05-details-modal');
      await expect(page.locator('.back-to-top')).toHaveCount(0);

      // dress code modal on top of details
      await page.click('.details-modal__dresscode');
      await page.waitForSelector('.dress-modal');
      await page.waitForTimeout(450);
      await shot(page, vp.name, lang, '06-dresscode-modal');
      await assertNoHorizontalOverflow(page, 'dresscode modal');

      // hearts fit one row
      const heartsHeight = await page
        .locator('.dress-modal__hearts')
        .evaluate((el) => el.getBoundingClientRect().height);
      expect(heartsHeight, 'hearts wrapped').toBeLessThan(60);

      // tap a heart, name appears in the reserved line
      await page.click('.dress-modal__heart >> nth=3');
      await expect(page.locator('.dress-modal__swatch-name')).not.toHaveText(/^\s*$/);
      await shot(page, vp.name, lang, '07-dresscode-heart');

      // Escape closes only the dress code modal; details stays; focus returns
      await page.keyboard.press('Escape');
      await page.waitForTimeout(250);
      await expect(page.locator('.dress-modal')).toHaveCount(0);
      await expect(page.locator('.details-modal')).toBeVisible();
      const focusOnDressBtn = await page.evaluate(
        () => document.activeElement?.classList.contains('details-modal__dresscode') ?? false,
      );
      expect(focusOnDressBtn, 'focus returned to dress code trigger').toBe(true);

      // Escape again closes details; focus back to teaser
      await page.keyboard.press('Escape');
      await page.waitForTimeout(250);
      const focusReturned = await page.evaluate(
        () => document.activeElement?.classList.contains('paper-cta') ?? false,
      );
      expect(focusReturned, 'focus returned to details trigger').toBe(true);

      // RSVP: invalid → error, valid → success (mock transport in test build)
      const rsvpBtn = page.locator('.rsvp-teaser .paper-cta');
      await rsvpBtn.scrollIntoViewIfNeeded();
      await rsvpBtn.click();
      await page.waitForSelector('.rsvp-form');
      await page.waitForTimeout(450);
      await shot(page, vp.name, lang, '08-rsvp-modal');
      await assertNoHorizontalOverflow(page, 'rsvp modal');

      await page.click('.rsvp-form__submit');
      await page.waitForSelector('.rsvp-form__error');
      await shot(page, vp.name, lang, '09-rsvp-error');

      await page.fill('.rsvp-form input >> nth=0', 'გიორგი');
      await page.fill('.rsvp-form input >> nth=1', 'ბერიძე');
      await page.click('.rsvp-form__choice >> nth=0');
      await page.waitForTimeout(450);
      await page.click('.rsvp-form__submit');
      await page.waitForSelector('.rsvp-success', { timeout: 10_000 });
      await shot(page, vp.name, lang, '10-rsvp-success');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(250);

      // BackToTop scrolls home
      await page.locator('.footer').scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await page.click('.back-to-top');
      await page.waitForFunction(() => window.scrollY < 10, undefined, { timeout: 5000 });

      // keyboard pass
      const missingRing: string[] = [];
      for (let i = 0; i < 40; i++) {
        await page.keyboard.press('Tab');
        const info = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el === document.body) return null;
          const style = getComputedStyle(el);
          return {
            tag: `${el.tagName.toLowerCase()}.${el.className.split(' ')[0] ?? ''}`,
            hasRing:
              (style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0) ||
              style.boxShadow !== 'none',
          };
        });
        if (info && !info.hasRing) missingRing.push(info.tag);
      }
      expect(missingRing, 'elements missing focus ring').toEqual([]);

      expect(errors, 'console errors / uncaught rejections').toEqual([]);
    });
  }
}

test('1280px: envelope hover affordance, no stuck touch hover', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForSelector('.envelope');
  await page.hover('.envelope-trigger');
  await page.waitForTimeout(220);
  await page.screenshot({
    path: path.join(SHOT_DIR, '1280-hover-mid.png'),
  });
  const scale = await page
    .locator('.envelope-trigger')
    .evaluate((el) => getComputedStyle(el).transform);
  expect(scale, 'hover scale applied').not.toBe('none');
});
