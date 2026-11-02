// Ortamın tek kaynağı: SITE_URL.
// Verilmişse yayın ortamıdır: sayfalar indekslenir, robots.txt sitemap'i gösterir.
// Verilmemişse önizlemedir (workers.dev, yerel): her sayfa noindex. Yanlış canonical ile indekslenmeyi önler.
export const VARSAYILAN_URL = 'https://takirtakir.com';
export const SITE_URL = process.env.SITE_URL || VARSAYILAN_URL;
export const YAYIN = Boolean(process.env.SITE_URL);
