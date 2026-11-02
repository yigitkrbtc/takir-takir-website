// Yapılandırılmış veri (JSON-LD). Metnin kendisi de HTML'de durur; bu, makinelerin sayfayı doğru okuması için.
// Varlıklar @id ile birbirine bağlanır: Kuruluş ← WebSite ← her ders sayfası (yazar ve yayıncı aynı kuruluş).
import type {Konu} from '../konu/schema';
import {konuUrl} from '../konu/yol';
import {ogYolu} from './konular';
import {HESAPLAR, SITE_ADI, SITE_ACIKLAMA} from './site';

const mutlak = (site: URL, yol: string) => new URL(yol, site).toString();
const kurulusId = (site: URL) => mutlak(site, '/#kurulus');
const siteId = (site: URL) => mutlak(site, '/#site');

// Açılmış sosyal hesaplar (boşsa sameAs yazılmaz)
const hesapLinkleri = () =>
  Object.values(HESAPLAR).flatMap((h) => [h.tiktok, h.youtube, h.instagram]).filter((x): x is string => Boolean(x));

export function kurulus(site: URL) {
  const sameAs = hesapLinkleri();
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': kurulusId(site),
    name: SITE_ADI,
    url: site.toString(),
    logo: {'@type': 'ImageObject', url: mutlak(site, '/ikon-512.png'), width: 512, height: 512},
    description: SITE_ACIKLAMA,
    ...(sameAs.length ? {sameAs} : {}),
  };
}

export function webSitesi(site: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': siteId(site),
    name: SITE_ADI,
    url: site.toString(),
    inLanguage: 'tr',
    description: SITE_ACIKLAMA,
    publisher: {'@id': kurulusId(site)},
  };
}

export function kirinti(site: URL, ogeler: {ad: string; yol: string}[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: ogeler.map((o, i) => ({'@type': 'ListItem', position: i + 1, name: o.ad, item: mutlak(site, o.yol)})),
  };
}

// Düz sayfa (hakkında, gizlilik): WebPage, siteye bağlı
export function sayfa(site: URL, yol: string, ad: string, aciklama: string, tur: 'AboutPage' | 'WebPage' = 'WebPage') {
  const url = mutlak(site, yol);
  return {'@context': 'https://schema.org', '@type': tur, '@id': url, url, name: ad, description: aciklama, inLanguage: 'tr', isPartOf: {'@id': siteId(site)}, publisher: {'@id': kurulusId(site)}};
}

export function konuJsonld(site: URL, k: Konu) {
  const url = mutlak(site, konuUrl(k));
  const kaynaklar = k.iddialar.filter((d) => d.durum === 'dogru' && d.kaynak).map((d) => ({'@type': 'CreativeWork', url: d.kaynak!.url, name: d.kaynak!.ad}));
  const ders = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    '@id': `${url}#ders`,
    name: k.baslik,
    headline: k.konu,
    description: k.ozet,
    abstract: k.ozet,
    url,
    mainEntityOfPage: url,
    image: mutlak(site, ogYolu(k)),
    inLanguage: 'tr',
    learningResourceType: ['Konu anlatımı', 'Etkileşimli ders', 'Flash kart', 'Çözümlü örnek'],
    educationalLevel: k.seviye,
    timeRequired: `PT${k.sure}M`,
    educationalAlignment: {'@type': 'AlignmentObject', alignmentType: 'educationalSubject', targetName: `${k.sinav} ${k.ders}`},
    about: {'@type': 'Thing', name: k.konu},
    teaches: k.kural.cumle,
    keywords: k.aramalar.join(', '),
    isAccessibleForFree: true,
    datePublished: k.yayin,
    dateModified: k.guncelleme,
    author: {'@id': kurulusId(site)},
    publisher: {'@id': kurulusId(site)},
    isPartOf: {'@id': siteId(site)},
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
    isPartOf: {'@id': `${url}#ders`},
    hasPart: k.kartlar.map((c) => ({
      '@type': 'Question',
      eduQuestionType: 'Flashcard',
      text: c.on,
      acceptedAnswer: {'@type': 'Answer', text: c.arka},
    })),
  };
  // SSS: Google zengin sonucu yalnız resmî sağlık/devlet sitelerine veriyor; AI motorları ve Bing için soru-cevap eşlemesi yine değerli.
  const sss = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}#sorular`,
    inLanguage: 'tr',
    isPartOf: {'@id': `${url}#ders`},
    mainEntity: k.sorular.map((s) => ({'@type': 'Question', name: s.soru, acceptedAnswer: {'@type': 'Answer', text: s.cevap}})),
  };
  return [ders, quiz, sss];
}
