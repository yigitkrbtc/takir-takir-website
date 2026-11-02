// llms.txt: AI motorları için site özeti (masrafsız; etkisi kanıtlanmış değil). Sınav ve derse göre gruplu.
import type {APIRoute} from 'astro';
import {tumKonular} from '../lib/konular';
import {DERSLER, SITE_ACIKLAMA, SITE_ADI} from '../lib/site';
import {konuUrl} from '../konu/yol';

export const GET: APIRoute = async ({site}) => {
  const konular = await tumKonular();
  const url = (yol: string) => new URL(yol, site).toString();
  const satirlar = [
    `# ${SITE_ADI}`,
    '',
    `> ${SITE_ACIKLAMA}`,
    '',
    'Her konu sayfasında sırasıyla: tek başına alıntılanabilir özet, kural ve formül, nedenleri, çözümlü örnek, sık yapılan hata, flash kartlar, sık sorulan sorular ve kaynak listesi bulunur. Bir sayfada en çok 8 kilit bilgi vardır. Her biri ya güvenilir bir kaynaktan birebir alıntıyla ya da kodla (denklem ve yük dengesi) doğrulanır. Doğrulanmamış bilgi yayınlanmaz.',
    '',
  ];
  for (const sinav of ['TYT', 'AYT'] as const) {
    const ks = konular.filter((k) => k.sinav === sinav);
    if (!ks.length) continue;
    satirlar.push(`## ${sinav}`, '');
    for (const d of DERSLER[sinav]) {
      const dk = ks.filter((k) => k.dersSlug === d.slug);
      if (!dk.length) continue;
      satirlar.push(`### ${sinav} ${d.ad}`, '');
      for (const k of dk) satirlar.push(`- [${k.konu}: ${k.altBaslik}](${url(konuUrl(k))}): ${k.ozet}`);
      satirlar.push('');
    }
  }
  satirlar.push('## Site', '', `- [Hakkında ve yöntem](${url('/hakkinda/')}): içeriğin nasıl hazırlandığı ve doğrulandığı.`, `- [Gizlilik](${url('/gizlilik/')})`, '');
  return new Response(satirlar.join('\n'), {headers: {'Content-Type': 'text/plain; charset=utf-8'}});
};
