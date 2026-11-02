// Kimya yardımcıları: formül ayrıştırma, yük ve denklem dengesi, terim sözlüğü.
// Kod tarafı doğruluk: model formül uydurmaz, denklem dengesi elle değil burada kontrol edilir.

const ALT: Record<string, string> = {'₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9'};
const UST: Record<string, string> = {'⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9'};

export type Atomlar = Record<string, number>;
export type Tur = {katsayi: number; atomlar: Atomlar; yuk: number};

const ekle = (a: Atomlar, b: Atomlar, k = 1) => {
  for (const [el, n] of Object.entries(b)) a[el] = (a[el] ?? 0) + n * k;
  return a;
};

// "2CH₃COOH", "CO₃²⁻", "Ca(CH₃COO)₂", "H⁺", "CO₂↑" → katsayı, atomlar, yük
export function turAyristir(girdi: string): Tur {
  let s = girdi.replace(/[↑↓]/g, '').replace(/\((aq|s|l|g|k|suda)\)$/i, '').trim();
  const km = s.match(/^(\d+)\s*/);
  const katsayi = km ? Number(km[1]) : 1;
  if (km) s = s.slice(km[0].length);

  // yük: sondaki üst simgeler (²⁻, ⁺, ³⁺)
  let yuk = 0;
  const ym = s.match(/([⁰¹²³⁴⁵⁶⁷⁸⁹]*)([⁺⁻])$/);
  if (ym) {
    const n = ym[1] ? Number([...ym[1]].map((c) => UST[c]).join('')) : 1;
    yuk = ym[2] === '⁺' ? n : -n;
    s = s.slice(0, s.length - ym[0].length);
  }
  s = [...s].map((c) => ALT[c] ?? c).join('');

  let i = 0;
  const grup = (): Atomlar => {
    const a: Atomlar = {};
    while (i < s.length && s[i] !== ')') {
      if (s[i] === '(') {
        i++;
        const ic = grup();
        if (s[i] !== ')') throw new Error(`Kapanmayan parantez: ${girdi}`);
        i++;
        ekle(a, ic, sayi());
      } else {
        const m = s.slice(i).match(/^[A-Z][a-z]?/);
        if (!m) throw new Error(`Formül okunamadı: ${girdi} (konum ${i})`);
        i += m[0].length;
        ekle(a, {[m[0]]: 1}, sayi());
      }
    }
    return a;
  };
  const sayi = () => {
    const m = s.slice(i).match(/^\d+/);
    if (!m) return 1;
    i += m[0].length;
    return Number(m[0]);
  };
  const atomlar = grup();
  if (i !== s.length) throw new Error(`Formül okunamadı: ${girdi}`);
  return {katsayi, atomlar, yuk};
}

const taraf = (t: string) => t.split(/\s\+\s/).map((x) => x.trim()).filter(Boolean).map(turAyristir);
const topla = (turler: Tur[]) =>
  turler.reduce(
    (acc, t) => ({atomlar: ekle(acc.atomlar, t.atomlar, t.katsayi), yuk: acc.yuk + t.yuk * t.katsayi}),
    {atomlar: {} as Atomlar, yuk: 0},
  );

// "CaCO₃ + 2CH₃COOH → Ca(CH₃COO)₂ + H₂O + CO₂" → dengeli mi, değilse neden
export function denge(denklem: string): {dengeli: boolean; neden?: string} {
  const parca = denklem.split('→');
  if (parca.length !== 2) return {dengeli: false, neden: 'Denklemde tek bir → olmalı'};
  const sol = topla(taraf(parca[0]));
  const sag = topla(taraf(parca[1]));
  const el = new Set([...Object.keys(sol.atomlar), ...Object.keys(sag.atomlar)]);
  for (const e of el) {
    if ((sol.atomlar[e] ?? 0) !== (sag.atomlar[e] ?? 0)) return {dengeli: false, neden: `${e}: sol ${sol.atomlar[e] ?? 0}, sağ ${sag.atomlar[e] ?? 0}`};
  }
  if (sol.yuk !== sag.yuk) return {dengeli: false, neden: `yük: sol ${sol.yuk}, sağ ${sag.yuk}`};
  return {dengeli: true};
}

export const yukYaz = (n: number) => (n === 0 ? '0' : `${n > 0 ? '+' : '−'}${Math.abs(n)}`);

// Görsel kitler için: "2CH₃COO⁻" → {katsayi: 2, govde: "CH₃COO⁻", yuk: -1}
export function turBilgisi(f: string): {katsayi: number; govde: string; yuk: number} {
  const km = f.match(/^(\d+)\s*/);
  const govde = km ? f.slice(km[0].length) : f;
  try {
    const {katsayi, yuk} = turAyristir(f);
    return {katsayi, govde, yuk};
  } catch {
    // Formül değilse (ör. "ısı") görsel çökmez; doğruluk build'de denge() ile denetlenir
    return {katsayi: km ? Number(km[1]) : 1, govde, yuk: 0};
  }
}

// "2CO₂(g)↑" → "CO₂": katsayı, ok ve faz eki olmadan
const sade = (f: string) => turBilgisi(f).govde.replace(/[↑↓]/g, '').replace(/\s*\((aq|s|l|g|k|suda)\)\s*$/i, '').trim();

// Oda koşullarında gaz olan, sık geçen türler (görselde yeşil kutu ve kabarcık)
const GAZLAR = new Set(['CO₂', 'H₂', 'O₂', 'N₂', 'Cl₂', 'NH₃', 'SO₂', 'NO₂', 'CH₄']);
// Gaz: listede ya da açıkça (g) / ↑ ile işaretli
export const gazMi = (f: string) => f.includes('↑') || /\(g\)\s*$/i.test(f) || GAZLAR.has(sade(f));

// Terim sözlüğü: ad → formül. Konu paketindeki terim formülleri buradakiyle aynı olmalı.
// Metinde geçen her ad, paketin terimler listesinde olmalı (öğrenci tanımı görmeden ilerlemesin).
export const SOZLUK: Record<string, string> = {
  'asetik asit': 'CH₃COOH',
  asetat: 'CH₃COO⁻',
  karbonat: 'CO₃²⁻',
  bikarbonat: 'HCO₃⁻',
  'karbonik asit': 'H₂CO₃',
  'kalsiyum karbonat': 'CaCO₃',
  'kalsiyum asetat': 'Ca(CH₃COO)₂',
  'sodyum karbonat': 'Na₂CO₃',
  'sodyum klorür': 'NaCl',
  'hidroklorik asit': 'HCl',
  'sodyum hidroksit': 'NaOH',
  karbondioksit: 'CO₂',
  'hidrojen iyonu': 'H⁺',
  'hidrojen gazı': 'H₂',
  'kalsiyum iyonu': 'Ca²⁺',
};
