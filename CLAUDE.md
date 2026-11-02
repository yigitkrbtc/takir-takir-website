# CLAUDE.md: takir-takir-website

Takır Takır sitesi: YKS (TYT/AYT) konuları için etkileşimli dersler, flash kartlar ve kaynaklı bilgi. Hedef okur orta düzey bir lise öğrencisi, telefondan.

## Yapı
- `konu/<id>.json`: konu paketi, tek kaynak. Site (ve ileride video, uygulama) buradan okur. Şema: `src/konu/schema.ts`.
- `src/konu/kimya.ts`: formül ayrıştırma, denklem/yük dengesi, terim sözlüğü (`SOZLUK`). Formül modelden değil sözlükten gelir.
- `scripts/kontrol.ts`: build öncesi zorunlu. Şema, denklem dengesi, terim kapsamı, iddia bütçesi, bağlantılar, kısa link çakışması. Hata = build yok.
- `src/pages/[sinav]/[ders]/[slug].astro`: konu sayfası. Sıra: özet → tahmin et → gör (görsel kit) → kural → neden → çözümlü örnek → sık hata → flash kart → video → kaynaklar.
- `src/components/islands/`: React adacıkları (`client:visible`). Metnin tamamı sunucuda HTML'e basılır; JS yalnız etkileşim için.
- `src/lib/seo.ts`: JSON-LD (LearningResource, Quiz/Flashcard, BreadcrumbList, Organization, WebSite).

## Kurallar
- Her sayfanın başındaki `ozet` tek başına alıntılanabilir olmalı (≤ 320 karakter, ≤ 25 kelime/cümle).
- Kilit iddia ≤ 8: kural, formül, sayı, tarih, cevap, sık hata. Denklem ve hesap kodla (`yontem: hesap`), gerisi beyaz liste kaynaktan 1 kaynak + birebir alıntı. `belirsiz`/`yanlis` varsa yayın yok.
- Metinde geçen her kimyasal ad `terimler` listesinde, formülü `SOZLUK` ile aynı.
- İçeriği olmayan ders sayfası üretilmez; içeriği olmayan sınav sayfası `noindex` ve sitemap dışı.
- Kısa link: video seri numarası → `/t<no>` (TYT), `/a<no>` (AYT).
- Tasarım dili videoyla aynı: koyu zemin #0E1117, sarı #F5B83D, beyaz #F5F1E8; açık tema var. Mobil önce, gövde 18 px, dokunma hedefi ≥ 48 px.
- Bağımlılık sürümleri tam sabit (`--save-exact`), en az iki haftalık sürüm.

## Komutlar
`npm run dev` · `npm run kontrol` · `npm run build` (kontrol + build) · `npm run typecheck`

## Açık
- Alan adı alınmadı: `SITE_URL` ortam değişkeni, varsayılan yer tutucu `https://takirtakir.com` (robots.txt içinde de).
- Sosyal hesap linkleri `src/lib/site.ts` → `HESAPLAR` (boşsa gösterilmez).
