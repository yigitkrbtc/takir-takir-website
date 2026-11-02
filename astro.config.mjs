// @ts-check
import {defineConfig} from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import {readdirSync, readFileSync} from 'node:fs';

// Alan adı alınana kadar yer tutucu. SITE_URL ile değiştirilir.
const site = process.env.SITE_URL ?? 'https://takirtakir.com';

// Kısa linkler: videodaki seri numarası → konu sayfası (TYT #4 → /t4, AYT #4 → /a4)
/** @type {Record<string, string>} */
const redirects = {};
const sinavlar = new Set();
for (const f of readdirSync('./konu').filter((x) => x.endsWith('.json'))) {
  const k = JSON.parse(readFileSync(`./konu/${f}`, 'utf8'));
  sinavlar.add(k.sinav.toLowerCase());
  const no = k.medya?.seriNo;
  if (no) redirects[`/${k.sinav === 'TYT' ? 't' : 'a'}${no}`] = `/${k.sinav.toLowerCase()}/${k.dersSlug}/${k.slug}/`;
}

export default defineConfig({
  site,
  trailingSlash: 'always',
  // Konusu olmayan sınav sayfası (ör. henüz AYT yoksa /ayt/) sitemap'e girmez, noindex taşır.
  integrations: [react(), sitemap({filter: (u) => ![...['tyt', 'ayt']].some((x) => !sinavlar.has(x) && new URL(u).pathname === `/${x}/`)})],
  redirects,
});
