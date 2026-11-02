// Paylaşım kartları: /og/site.png (genel) ve /og/<konu-id>.png
import type {APIRoute, GetStaticPaths} from 'astro';
import {tumKonular} from '../../lib/konular';
import {ogPng, type OgIcerik} from '../../lib/og';

export const getStaticPaths = (async () => {
  const konular = await tumKonular();
  const genel: OgIcerik = {etiket: 'YKS · TYT ve AYT', baslik: 'YKS konuları, takır takır akılda.', alt: 'Etkileşimli ders, flash kart, kaynaklı bilgi.'};
  return [
    {params: {ad: 'site'}, props: {icerik: genel}},
    ...konular.map((k) => ({
      params: {ad: k.id},
      props: {icerik: {etiket: `${k.sinav} · ${k.ders}`, baslik: k.konu, alt: k.altBaslik, alttaki: `~${k.sure} dk ders · ${k.kartlar.length} flash kart · kaynaklı`} satisfies OgIcerik},
    })),
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({props}) => {
  const png = await ogPng((props as {icerik: OgIcerik}).icerik);
  return new Response(new Uint8Array(png), {headers: {'Content-Type': 'image/png'}});
};
