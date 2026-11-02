// Marka ikonlarını üretir (public/). İşaret değişince çalıştır: npm run ikonlar
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {ikonSvg} from '../src/lib/marka.ts';

// URL.pathname yüzde kodludur (boşluk, Türkçe karakter): dosya yolu fileURLToPath ile
const hedef = (ad: string) => fileURLToPath(new URL(`../public/${ad}`, import.meta.url));

writeFileSync(hedef('favicon.svg'), ikonSvg(64, 0.1));
const pngler: [string, number, number, boolean][] = [
  ['apple-touch-icon.png', 180, 0.14, false], // iOS köşeyi kendisi yuvarlar
  ['ikon-192.png', 192, 0.12, true],
  ['ikon-512.png', 512, 0.12, true],
  ['ikon-maskable-512.png', 512, 0.24, false], // Android maskesi için güvenli alan
];
for (const [ad, boyut, pay, yuvarlak] of pngler) {
  await sharp(Buffer.from(ikonSvg(boyut, pay, yuvarlak))).png({compressionLevel: 9}).toFile(hedef(ad));
  console.log(ad);
}
