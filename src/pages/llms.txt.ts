// llms.txt: AI motorları için site özeti (masrafsız; etkisi kanıtlanmış değil).
import type {APIRoute} from 'astro';
import {getCollection} from 'astro:content';
import {SITE_ADI, konuUrl} from '../lib/site';

export const GET: APIRoute = async ({site}) => {
  const konular = (await getCollection('konu')).map((e) => e.data);
  const satirlar = [
    `# ${SITE_ADI}`,
    '',
    '> YKS (TYT ve AYT) konularını etkileşimli derslerle anlatan Türkçe eğitim sitesi. Her konu sayfasında özet, kural, çözümlü örnek, sık yapılan hata, flash kartlar ve kaynak listesi bulunur. Bilgiler kaynakla, denklemler kodla kontrol edilir.',
    '',
    '## Konular',
    ...konular.map((k) => `- [${k.sinav} ${k.ders}: ${k.konu}](${new URL(konuUrl(k), site)}): ${k.ozet}`),
    '',
  ];
  return new Response(satirlar.join('\n'), {headers: {'Content-Type': 'text/plain; charset=utf-8'}});
};
