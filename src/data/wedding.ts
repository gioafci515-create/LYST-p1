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
  dressCodePalette: [
    { hex: '#B3B198', name: { ka: 'მოსაზი', ru: 'Шалфей', en: 'Sage' } },
    { hex: '#6F6B46', name: { ka: 'ზეთისხილისფერი', ru: 'Оливковый', en: 'Olive' } },
    { hex: '#957964', name: { ka: 'ტაუპი', ru: 'Таупе', en: 'Taupe' } },
    { hex: '#754F38', name: { ka: 'შოკოლადისფერი', ru: 'Шоколад', en: 'Chocolate' } },
    { hex: '#251B12', name: { ka: 'მუქი ყავისფერი', ru: 'Тёмный', en: 'Espresso' } },
  ],
} as const;

export type WeddingPhoto = (typeof wedding.photos)[keyof typeof wedding.photos];
export type DressSwatch = { hex: string; name: Localized };
