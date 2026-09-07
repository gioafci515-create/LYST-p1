import type { Localized } from './translations';

export const wedding = {
  groom: { ka: 'დათა', ru: 'Дата', en: 'Data' },
  bride: { ka: 'ქეთი', ru: 'Кети', en: 'Keti' },
  initials: { first: 'D', second: 'K' },
  date: '2026-09-02T18:00:00+04:00', // Georgia is UTC+4, no DST
  displayDate: {
    ka: '2 სექტემბერი 2026',
    ru: '2 сентября 2026',
    en: '2 September 2026',
  },
  shortDate: '02.09.2026',
  rsvpDeadline: { ka: '10.08.2026-მდე', ru: 'до 10.08.2026', en: 'by 10.08.2026' },
  venue: {
    ka: 'რესტორანი „ლისი მერე“',
    ru: 'Ресторан «Лиси Мере»',
    en: 'Lisi Mere Restaurant',
  },
  mapUrl: 'https://maps.app.goo.gl/ek8ms6CT4Mg4vc7m9',
  schedule: [
    {
      time: '18:00',
      title: { ka: 'სტუმრების შეკრება', ru: 'Сбор гостей', en: 'Guests arrive' },
    },
    {
      time: '18:30',
      title: { ka: 'საქორწილო ცერემონია', ru: 'Свадебная церемония', en: 'Wedding ceremony' },
    },
    {
      time: '19:00',
      title: { ka: 'სადღესასწაულო ვახშამი', ru: 'Праздничный ужин', en: 'Celebration dinner' },
    },
  ],
  music: 'assets/music.mp3',
  creator: 'INVITÉ',

  /* Real photos, polaroid frame baked into the asset. Higher-res versions
     arrive later — swap the src here, keep the same aspect. */
  photos: {
    photo1: { src: 'assets/polaroid-1.png', width: 662, height: 830 },
    photo2: { src: 'assets/polaroid-2.png', width: 613, height: 738 },
  },

  /* Dress code modal. Hexes sampled from the poster's heart swatches
     (dresscode-source.jpg row at y=350). */
  dressCodeIntro: {
    ka: 'ჩვენთვის მთავარია თქვენი დასწრება! გაგვიხარდება, თუ თქვენი სამოსით ჩვენი ქორწილის ფერებს აჰყვებით.',
    ru: 'Для нас главное — ваше присутствие! Мы будем рады, если в своих нарядах вы поддержите цветовую гамму нашей свадьбы.',
    en: "What matters most is that you're there. We'd be glad if your outfit echoed the colours of our wedding.",
  },
  dressCodeNoWhite: {
    ka: 'გთხოვთ, გაითვალისწინოთ — თეთრი და თეთრის ნებისმიერი ელფერი დაუშვებელია',
    ru: 'Пожалуйста, учтите — белый и любые его оттенки недопустимы',
    en: 'Please note — white, and any shade of it, is not allowed',
  },
  /* five shades of white, all forbidden — the main heart row, every one
     crossed out in red so the rule reads at a glance rather than being
     inferred from a sentence. */
  dressCodePalette: [
    { hex: '#FFFFFF', name: { ka: 'თეთრი', ru: 'Белый', en: 'White' } },
    { hex: '#FFFFF0', name: { ka: 'სპილოს ძვლისფერი', ru: 'Слоновая кость', en: 'Ivory' } },
    { hex: '#F5F3EE', name: { ka: 'მარგალიტისფერი', ru: 'Жемчужный', en: 'Pearl' } },
    { hex: '#FFF5DC', name: { ka: 'კრემისფერი', ru: 'Кремовый', en: 'Cream' } },
    { hex: '#F0E2C4', name: { ka: 'შამპანურისფერი', ru: 'Шампань', en: 'Champagne' } },
  ],
  /* the same idea, smaller — two of the same family shown right next to
     the warning text itself, before the full row below. */
  dressCodeAvoidPalette: [
    { hex: '#E3C8AE', name: { ka: 'შამპანურისფერი', ru: 'Шампань', en: 'Champagne' } },
    { hex: '#E0BC9B', name: { ka: 'ბეჟი', ru: 'Бежевый', en: 'Beige' } },
  ],
} as const;

export type WeddingPhoto = (typeof wedding.photos)[keyof typeof wedding.photos];
export type DressSwatch = { hex: string; name: Localized };
