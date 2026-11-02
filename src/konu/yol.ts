// Konu adresleri: sayfalar, kısa linkler, sitemap ve llms.txt aynı fonksiyonları kullanır.
export type Sinav = 'TYT' | 'AYT';
type Yer = {sinav: Sinav; dersSlug: string; slug: string};
type Guncel = Yer & {guncelleme: string};

export const sinavYolu = (s: Sinav) => `/${s.toLowerCase()}/`;
export const dersYolu = (k: {sinav: Sinav; dersSlug: string}) => `${sinavYolu(k.sinav)}${k.dersSlug}/`;
export const konuUrl = (k: Yer) => `${dersYolu(k)}${k.slug}/`;

// Video seri numarası → kısa link (TYT #4 → /t4, AYT #4 → /a4)
export const kisaLink = (k: {sinav: Sinav; medya: {seriNo?: number}}) =>
  k.medya.seriNo ? `/${k.sinav === 'TYT' ? 't' : 'a'}${k.medya.seriNo}` : undefined;

// Her yolun son güncellemesi: konu sayfası kendi tarihi, üst sayfalar içlerindeki en yeni konu (sitemap lastmod).
export function sonGuncellemeler(konular: Guncel[]): Map<string, string> {
  const m = new Map<string, string>();
  const isle = (yol: string, t: string) => {
    if ((m.get(yol) ?? '') < t) m.set(yol, t);
  };
  for (const k of konular) {
    for (const yol of ['/', sinavYolu(k.sinav), dersYolu(k), konuUrl(k)]) isle(yol, k.guncelleme);
  }
  return m;
}
