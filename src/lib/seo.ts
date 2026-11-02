// Yapılandırılmış veri (JSON-LD). Metnin kendisi de HTML'de durur; bu, makinelerin sayfayı doğru okuması için.
import type {Konu} from '../konu/schema';
import {SITE_ADI, konuUrl} from './site';

const mutlak = (site: URL, yol: string) => new URL(yol, site).toString();

export function kurulus(site: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_ADI,
    url: site.toString(),
    description: 'YKS (TYT ve AYT) konularını kısa videolar, etkileşimli dersler ve flash kartlarla anlatan eğitim sitesi.',
  };
}

export function webSitesi(site: URL) {
  return {'@context': 'https://schema.org', '@type': 'WebSite', name: SITE_ADI, url: site.toString(), inLanguage: 'tr'};
}

export function kirinti(site: URL, ogeler: {ad: string; yol: string}[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: ogeler.map((o, i) => ({'@type': 'ListItem', position: i + 1, name: o.ad, item: mutlak(site, o.yol)})),
  };
}

export function konuJsonld(site: URL, k: Konu) {
  const url = mutlak(site, konuUrl(k));
  const kaynaklar = k.iddialar.filter((d) => d.durum === 'dogru' && d.kaynak).map((d) => d.kaynak!.url);
  const ders = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    '@id': `${url}#ders`,
    name: k.baslik,
    headline: k.konu,
    description: k.ozet,
    url,
    inLanguage: 'tr',
    learningResourceType: ['Konu anlatımı', 'Etkileşimli ders', 'Flash kart'],
    educationalLevel: k.seviye,
    educationalAlignment: {'@type': 'AlignmentObject', alignmentType: 'educationalSubject', targetName: `${k.sinav} ${k.ders}`},
    about: {'@type': 'Thing', name: k.konu},
    teaches: k.kural.cumle,
    keywords: k.aramalar.join(', '),
    isAccessibleForFree: true,
    dateModified: k.guncelleme,
    publisher: {'@type': 'Organization', name: SITE_ADI, url: site.toString()},
    citation: kaynaklar,
  };
  // Flash kartlar: Google'ın kart vitrini Türkçede yok; işaretleme yine de kartların ne olduğunu makineye söyler.
  const quiz = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    '@id': `${url}#kartlar`,
    name: `${k.konu}: flash kartlar`,
    about: {'@type': 'Thing', name: k.konu},
    educationalLevel: k.seviye,
    inLanguage: 'tr',
    hasPart: k.kartlar.map((c) => ({
      '@type': 'Question',
      eduQuestionType: 'Flashcard',
      text: c.on,
      acceptedAnswer: {'@type': 'Answer', text: c.arka},
    })),
  };
  return [ders, quiz];
}
