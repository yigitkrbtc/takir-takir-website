// Site geneli sabitler. Sosyal hesaplar açılınca linkler buraya girer (boşsa sayfada gösterilmez).
export const SITE_ADI = 'Takır Takır';

export const HESAPLAR: Record<'TYT' | 'AYT', {ad: string; tiktok?: string; youtube?: string; instagram?: string}> = {
  TYT: {ad: 'Takır Takır TYT'},
  AYT: {ad: 'Takır Takır AYT'},
};

// MEB/ÖSYM ders listesi (din kültürü ve felsefe proje kapsamı dışında)
export const DERSLER: Record<'TYT' | 'AYT', {ad: string; slug: string}[]> = {
  TYT: [
    {ad: 'Türkçe', slug: 'turkce'},
    {ad: 'Matematik', slug: 'matematik'},
    {ad: 'Geometri', slug: 'geometri'},
    {ad: 'Fizik', slug: 'fizik'},
    {ad: 'Kimya', slug: 'kimya'},
    {ad: 'Biyoloji', slug: 'biyoloji'},
    {ad: 'Tarih', slug: 'tarih'},
    {ad: 'Coğrafya', slug: 'cografya'},
  ],
  AYT: [
    {ad: 'Matematik', slug: 'matematik'},
    {ad: 'Geometri', slug: 'geometri'},
    {ad: 'Fizik', slug: 'fizik'},
    {ad: 'Kimya', slug: 'kimya'},
    {ad: 'Biyoloji', slug: 'biyoloji'},
    {ad: 'Edebiyat', slug: 'edebiyat'},
    {ad: 'Tarih', slug: 'tarih'},
    {ad: 'Coğrafya', slug: 'cografya'},
  ],
};

export const konuUrl = (k: {sinav: string; dersSlug: string; slug: string}) => `/${k.sinav.toLowerCase()}/${k.dersSlug}/${k.slug}/`;
