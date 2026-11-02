import {defineConfig} from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import {SITE_URL} from './src/lib/ortam.ts';
import {konulariOku} from './src/konu/yukle.ts';
import {kisaLink, konuUrl, sinavYolu, sonGuncellemeler} from './src/konu/yol.ts';

// Konular tek okuyucudan, şemayla (src/konu/yukle.ts). Sayfalar aynı dizini içerik koleksiyonuyla okur.
const konular = konulariOku();

// Kısa linkler: videodaki seri numarası → konu sayfası (TYT #4 → /t4)
const redirects = Object.fromEntries(konular.flatMap((k) => (kisaLink(k) ? [[kisaLink(k)!, konuUrl(k)]] : [])));

// Konusu olmayan sınav sayfası noindex taşır, sitemap'e girmez.
const bosSinavlar = new Set((['TYT', 'AYT'] as const).filter((s) => !konular.some((k) => k.sinav === s)).map(sinavYolu));
const tarihler = sonGuncellemeler(konular);

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  integrations: [
    react(),
    sitemap({
      filter: (u) => !bosSinavlar.has(new URL(u).pathname),
      serialize: (oge) => {
        const t = tarihler.get(new URL(oge.url).pathname);
        return t ? {...oge, lastmod: t} : oge;
      },
    }),
  ],
  redirects,
});
