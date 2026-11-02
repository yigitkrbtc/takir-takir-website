// robots.txt ortama göre: yayında sitemap gösterilir; önizlemede sayfalar zaten noindex taşır (Base.astro).
// Önizlemede tarama kapatılmaz: Google noindex'i görebilsin ve adresi dizinden düşürsün.
import type {APIRoute} from 'astro';
import {YAYIN} from '../lib/ortam';

const AI_BOTLARI = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended'];

export const GET: APIRoute = ({site}) => {
  const satirlar = [
    YAYIN ? '# Arama ve AI motorları açık' : '# Önizleme ortamı: sayfalar noindex. Yayın adresi SITE_URL ile verilir.',
    'User-agent: *',
    'Allow: /',
    '',
    ...AI_BOTLARI.flatMap((b) => [`User-agent: ${b}`, 'Allow: /', '']),
    ...(YAYIN ? [`Sitemap: ${new URL('/sitemap-index.xml', site)}`] : []),
    '',
  ];
  return new Response(satirlar.join('\n'), {headers: {'Content-Type': 'text/plain; charset=utf-8'}});
};
