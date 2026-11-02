// Paylaşım kartı (Open Graph, 1200×630): build sırasında satori ile SVG, sharp ile PNG.
// Yazı satori'de yola çevrilir; sonuç build makinesinin fontlarına bağlı değildir.
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import {isaretSvg, RENK} from './marka';

const fontDosyasi = (alt: string, kalinlik: number) =>
  readFileSync(resolve(process.cwd(), `node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-${alt}-${kalinlik}-normal.woff`));

let fontlar: {name: string; data: Buffer; weight: 600 | 800; style: 'normal'}[] | undefined;
const fontlariYukle = () =>
  (fontlar ??= ([600, 800] as const).flatMap((weight) =>
    // Alt kümeler ayrı aile adıyla: satori aynı adlı ikinci dosyaya düşmüyor (ğ, ş, İ latin-ext'te)
    [['Jakarta', 'latin'], ['JakartaExt', 'latin-ext']].map(([name, alt]) => ({name, data: fontDosyasi(alt, weight), weight, style: 'normal' as const})),
  ));

// Marka fontunda alt/üst simge yok: CO₂ → CO2 (paylaşım kartında okunur kalır)
const ALT_UST: Record<string, string> = {'₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9', '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁺': '+', '⁻': '−'};
const duz = (s: string) => [...s].map((c) => ALT_UST[c] ?? c).join('').replace(/≈\s*/g, '~');

type Dugum = {type: string; props: {style?: Record<string, unknown>; children?: unknown; src?: string; width?: number; height?: number}};
const el = (type: string, style: Record<string, unknown>, children?: unknown, ek: Record<string, unknown> = {}): Dugum => ({type, props: {style, children, ...ek}});

export type OgIcerik = {etiket: string; baslik: string; alt?: string; alttaki?: string};

export async function ogPng({etiket, baslik, alt, alttaki}: OgIcerik): Promise<Buffer> {
  const isaret = `data:image/svg+xml;base64,${Buffer.from(isaretSvg(116)).toString('base64')}`;
  const agac = el('div', {width: 1200, height: 630, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 72px', background: RENK.zemin, color: RENK.beyaz, fontFamily: 'Jakarta, JakartaExt'}, [
    el('div', {display: 'flex', alignItems: 'center', gap: 20}, [
      el('img', {}, undefined, {src: isaret, width: 116, height: 72}),
      el('div', {display: 'flex', fontSize: 46, fontWeight: 800, letterSpacing: -1.6}, [el('span', {}, 'Takır'), el('span', {color: RENK.sari}, 'Takır')]),
    ]),
    el('div', {display: 'flex', flexDirection: 'column', gap: 18}, [
      el('div', {display: 'flex'}, el('span', {fontSize: 28, fontWeight: 800, color: RENK.sari, background: 'rgba(245,184,61,0.14)', padding: '8px 18px', borderRadius: 999}, duz(etiket))),
      el('div', {fontSize: baslik.length > 34 ? 66 : 80, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2.4}, duz(baslik)),
      alt ? el('div', {fontSize: 40, fontWeight: 600, color: RENK.sari, lineHeight: 1.2}, duz(alt)) : el('div', {display: 'none'}),
    ]),
    el('div', {display: 'flex', fontSize: 26, fontWeight: 600, color: '#8A8679'}, duz(alttaki ?? 'Önce tahmin et, sonra gör, sonra kendini test et.')),
  ]);
  const svg = await satori(agac as never, {width: 1200, height: 630, fonts: fontlariYukle()});
  return sharp(Buffer.from(svg)).png({compressionLevel: 9}).toBuffer();
}
