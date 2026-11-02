# CLAUDE.md: takir-takir-website

Takır Takır sitesi: YKS (TYT/AYT) konuları için etkileşimli dersler, flash kartlar ve kaynaklı bilgi. Hedef okur orta düzey bir lise öğrencisi, telefondan.

## Çalışma ilkeleri (Yiğit, 2026-11-02)
Bu repoda her iş şu altı gözle yapılır: pazarlama uzmanı, SEO ve GEO uzmanı, uzman yazılım mimarı, uzman yazılımcı, UI/UX tasarımcısı, QA mühendisi.
- Site her zaman SEO ve GEO uyumludur. Bir değişiklik görünürlüğü düşürüyorsa (metni JS'e taşımak, yapılandırılmış veriyi bozmak, canonical/sitemap/robots kırmak, özeti ve kaynakları gizlemek) yapılmaz.
- Kod modülerdir: her sorumluluk tek yerde (okuma `yukle.ts`, kural `denetle.ts`, adres `yol.ts`, depolama `depo.ts`, marka `marka.ts`). Aynı mantık iki yerde yazılmaz.
- Her iş profesyonel biter: tip kontrolü temiz, isimler ve yorumlar Türkçe ve anlamlı, geçici çözüm bırakılmaz.
- QA gibi test edilir: yeni kural ya da fonksiyon testle gelir, bozuk girdiyle de denenir. Arayüz değişikliği Playwright ile 390 px ve 1280 px, koyu ve açık temada, konsol hatası ve 48 px altı dokunma hedefi olmadan doğrulanır.
- Token az harcanır: yalnız gereken dosya ve satır okunur, çıktı kısa tutulur, aynı dosya tekrar okunmaz.

## Yapı
- `konu/<id>.json`: konu paketi, tek kaynak. Site (ve ileride video, uygulama) buradan okur. Şema: `src/konu/schema.ts`.
- `src/konu/`: sayfadan bağımsız, Node'da da çalışan çekirdek (import'lar `.ts` uzantılı).
  - `yukle.ts`: paketlerin tek okuyucusu (`KONU_DIZINI`, şema ayrıştırma). astro.config, kontrol betiği, testler ve içerik koleksiyonu aynı dizini kullanır.
  - `denetle.ts`: anlam kontrolü, saf fonksiyon (denklem/yük dengesi, terim kapsamı, iddia durumu, okunabilirlik, bağlantılar, kısa link çakışması).
  - `kimya.ts`: formül ayrıştırma, denge, `turBilgisi`/`gazMi` (görsel kit de bunu kullanır), terim sözlüğü `SOZLUK`. Formül modelden değil sözlükten gelir.
  - `yol.ts`: konu/ders/sınav adresleri, kısa link, sitemap `lastmod` tarihleri.
- `scripts/kontrol.ts`: build öncesi zorunlu, hata = build yok. `scripts/ikonlar.ts`: marka ikonlarını üretir (`public/`).
- `src/lib/`: `ortam.ts` (SITE_URL, yayın/önizleme), `site.ts` (sabitler, dersler, hesaplar), `seo.ts` (JSON-LD), `og.ts` (paylaşım kartı), `marka.ts` (logo işareti, tek çizim), `depo.ts` (localStorage, `tt:v1:` öneki), `tekrar.ts` (Leitner ve seri), `konular.ts` (sayfaların koleksiyon erişimi), `bolumler.ts` (konu sayfası bölüm sırası).
- `src/pages/[sinav]/[ders]/[slug].astro`: konu sayfası, bölüm bileşenleri `src/components/konu/`. Sıra `src/lib/bolumler.ts`'te: tahmin et → gör (görsel kit) → kural → neden → çözümlü örnek → sık hata → flash kart → sık sorulan sorular, sonra video, ders sonu, kaynaklar.
- Görsel kitler: şemada `gorsel.kit` ayrımlı birleşim, `src/components/konu/Gorsel.astro` kit → ada eşlemesi. Yeni kit = şema varyantı + bir satır + ada.
- `src/components/islands/`: React adacıkları (`client:visible`). Metnin tamamı sunucuda HTML'e basılır; JS yalnız etkileşim için.
- `src/pages/og/[ad].png.ts`: build sırasında 1200×630 paylaşım kartları. `robots.txt.ts`, `llms.txt.ts`: ortama göre üretilir.
- `test/`: `node --test`. CI: `.github/workflows/ci.yml` (kontrol, test, typecheck, build).

## Kurallar
- Her sayfanın başındaki `ozet` tek başına alıntılanabilir olmalı (≤ 320 karakter, ≤ 25 kelime/cümle). `sorular` (3-6): öğrencinin gerçekten sorduğu soru + tek başına alıntılanabilir cevap.
- Kilit iddia ≤ 8: kural, formül, sayı, tarih, cevap, sık hata. Denklem ve hesap kodla (`yontem: hesap`), gerisi beyaz liste kaynaktan 1 kaynak + birebir alıntı. `dogru` dışında bir durum (`bekliyor`, `belirsiz`, `yanlis`) varsa yayın yok.
- Tarihler: paketteki tarih UTC'de biçimlenir; kullanıcının günü (seri, tekrar) yerel takvim günüdür.
- Dosya yolları çalışma klasörüne bağlı olmaz (`import.meta.url`, `fileURLToPath`, Node çözümlemesi).
- Metinde geçen her kimyasal ad `terimler` listesinde, formülü `SOZLUK` ile aynı.
- İçeriği olmayan ders sayfası üretilmez; içeriği olmayan sınav sayfası `noindex` ve sitemap dışı.
- `SITE_URL` verilmezse önizleme: her sayfa `noindex`, robots.txt sitemap göstermez. Yayın ortamında (alan adı) `SITE_URL` build değişkeni olarak verilir.
- Kısa link: video seri numarası → `/t<no>` (TYT), `/a<no>` (AYT).
- Tasarım dili videoyla aynı: koyu zemin #0E1117, sarı #F5B83D, beyaz #F5F1E8; açık tema var. Font Plus Jakarta Sans (sitede barındırılır). Logo: iki klavye tuşu + "TakırTakır". Mobil önce, gövde 18 px, dokunma hedefi ≥ 48 px.
- Tarayıcı depolaması yalnız `src/lib/depo.ts` üzerinden.
- Bağımlılık sürümleri tam sabit (`--save-exact`), en az iki haftalık sürüm.

## Komutlar
`npm run dev` · `npm run kontrol` · `npm test` · `npm run typecheck` · `npm run build` (kontrol + build) · `npm run ikonlar`

## Açık
- Alan adı alınmadı: varsayılan yer tutucu `https://takirtakir.com`. Alınınca Cloudflare build değişkeni `SITE_URL` girilir.
- Sosyal hesap linkleri `src/lib/site.ts` → `HESAPLAR`, iletişim `ILETISIM` (boşsa gösterilmez).
