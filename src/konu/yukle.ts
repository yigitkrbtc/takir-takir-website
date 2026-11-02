// Konu paketlerinin tek okuyucusu. astro.config (kısa link, sitemap), kontrol betiği ve testler buradan okur.
// Sayfalar aynı dizini Astro içerik koleksiyonuyla, aynı şemayla okur (src/content.config.ts).
import {readdirSync, readFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {KonuSchema, type Konu} from './schema.ts';

// Proje köküne göre (Astro içerik koleksiyonu bu biçimi ister)
export const KONU_DIZINI = './konu';
// Bu dosyaya göre mutlak yol: betik hangi klasörden çalışırsa çalışsın aynı dizin
const VARSAYILAN = fileURLToPath(new URL('../../konu/', import.meta.url));

export type HamPaket = {dosya: string; veri: unknown};

export function hamPaketler(dizin = VARSAYILAN): HamPaket[] {
  const tam = resolve(dizin);
  return readdirSync(tam)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((dosya) => ({dosya, veri: JSON.parse(readFileSync(join(tam, dosya), 'utf8'))}));
}

// Şemaya uymayan paket ayrılır, sorunları döner. Anlam kontrolleri denetle.ts'te.
export function ayristir(ham: HamPaket[]): {paketler: {dosya: string; k: Konu}[]; sorunlar: string[]} {
  const paketler: {dosya: string; k: Konu}[] = [];
  const sorunlar: string[] = [];
  for (const {dosya, veri} of ham) {
    const r = KonuSchema.safeParse(veri);
    if (r.success) paketler.push({dosya, k: r.data});
    else for (const i of r.error.issues) sorunlar.push(`${dosya}: ${i.path.join('.')} → ${i.message}`);
  }
  return {paketler, sorunlar};
}

// Şemaya uymayan paket varsa durur (yapılandırma yanlış veriyle kurulmasın).
export function konulariOku(dizin = VARSAYILAN): Konu[] {
  const {paketler, sorunlar} = ayristir(hamPaketler(dizin));
  if (sorunlar.length) throw new Error(`Konu paketi şemaya uymuyor:\n${sorunlar.join('\n')}`);
  return paketler.map((p) => p.k);
}
