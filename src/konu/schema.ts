import {z} from 'astro/zod';

// Konu paketi: bir konunun tek kaynağı. Site, video ve uygulama bu dosyayı okur.
// Sınırlar burada; anlam kontrolleri (denge, terim, iddia) scripts/kontrol.ts içinde.

const tur = z.object({f: z.string().min(1), ad: z.string().optional()});

export const TepkimeAdim = z.object({
  baslik: z.string().max(60),
  sol: z.array(tur).min(1),
  sag: z.array(tur).min(1),
  not: z.string().max(220),
  yukGoster: z.boolean().default(false), // yük toplamını ekranda göster
  denklem: z.boolean().default(true), // false: yalnız başlangıç durumu (ok yok, denge kontrolü yok)
});

export const Gorsel = z.discriminatedUnion('kit', [
  z.object({kit: z.literal('tepkime'), baslik: z.string(), adimlar: z.array(TepkimeAdim).min(2).max(8)}),
]);

export const Iddia = z.object({
  id: z.string(),
  tur: z.enum(['kural', 'formul', 'sayi', 'tarih', 'bilgi', 'cevap', 'hata']),
  metin: z.string(),
  yontem: z.enum(['kaynak', 'hesap']),
  durum: z.enum(['dogru', 'yanlis', 'belirsiz', 'bekliyor']),
  kaynak: z.object({url: z.string().url(), ad: z.string(), alinti: z.string().min(1), erisim: z.string()}).optional(),
  hesap: z.string().optional(), // yontem=hesap: kontrol edilecek denklem
  not: z.string().optional(),
});

export const KonuSchema = z.object({
  id: z.string(),
  sinav: z.enum(['TYT', 'AYT']),
  ders: z.string(),
  dersSlug: z.string().regex(/^[a-z0-9-]+$/),
  unite: z.string(),
  konu: z.string(),
  baslik: z.string().max(70), // sayfa başlığı (arama sonucunda görünen)
  altBaslik: z.string().max(60), // sayfadaki merak sorusu
  sure: z.number().int().min(2).max(15), // ders süresi, dakika
  slug: z.string().regex(/^[a-z0-9-]+$/),
  seviye: z.string(),
  onBilgi: z.array(z.string()).default([]),
  sonraki: z.array(z.string()).default([]),
  aramalar: z.array(z.string()).min(3).max(6),
  ozet: z.string().max(320),
  tahmin: z.object({soru: z.string(), secenekler: z.array(z.string()).length(3), dogru: z.number().int().min(0).max(2), aciklama: z.string()}),
  gorsel: Gorsel,
  kural: z.object({
    cumle: z.string().max(80),
    formul: z.string(),
    parcalar: z.array(z.object({ifade: z.string(), anlam: z.string().max(120)})).min(2),
  }),
  neden: z.array(z.object({baslik: z.string().max(60), metin: z.string()})).min(2).max(4),
  sikHata: z.object({yanlis: z.string(), dogru: z.string(), neden: z.string()}),
  ornek: z.object({
    soru: z.string(),
    secenekler: z.array(z.string()).min(3).max(5),
    dogru: z.number().int().min(0),
    adimlar: z.array(z.object({metin: z.string(), formul: z.string().optional()})).min(2).max(6),
    puf: z.string().optional(),
  }),
  kartlar: z.array(z.object({id: z.string(), on: z.string().max(90), arka: z.string().max(220), tur: z.enum(['tanim', 'formul', 'hata', 'uygulama'])})).min(6).max(12),
  terimler: z.array(z.object({ad: z.string(), formul: z.string().optional(), tanim: z.string().max(160)})),
  iddialar: z.array(Iddia).max(8),
  medya: z.object({seriNo: z.number().int().positive().optional(), youtube: z.string().optional(), tiktok: z.string().optional(), instagram: z.string().optional()}).default({}),
  surum: z.number().int().positive(),
  guncelleme: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type Konu = z.infer<typeof KonuSchema>;
export type TepkimeAdimT = z.infer<typeof TepkimeAdim>;
