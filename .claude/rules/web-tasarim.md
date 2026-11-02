---
description: Site arayüzü ve tasarım kuralları (juliobsz/skills, MIT, uyarlanmış)
paths:
  - "src/pages/**"
  - "src/components/**"
  - "src/styles/**"
  - "src/layouts/**"
  - "public/**"
---

# Web tasarım kuralları (yalnız site)

Kaynak: github.com/juliobsz/skills, `awwwards` ve `jury` becerileri (MIT, © 2026 Julio). Yalnız bu sitenin hedefine uyan kısımlar alındı. Öncelik sırası: `CLAUDE.md` (SEO, GEO, modülerlik, QA, token) > bu dosya. Çelişirse CLAUDE.md kazanır.

## Tasarım ilkesi
- Hedef: telefondan ders çalışan lise öğrencisi. Etki değil okunurluk ve keyif. Efekt, metni ve yapılandırılmış veriyi geriye atmaz.
- Her durağan ekran afiş gibi durur: tür, boşluk, görsel kasıtlı. Hareket kompozisyonu güçlendirir, kurtarmaz.
- Tek imza anı: konu sayfasında "tahmin et → gör" etkileşimi. Çevresi sakin ve net kalır. Her yere süs eklenmez.
- İlk ekran (kıvrım üstü) sayfanın en iyi karesidir: ne olduğu 3 saniyede anlaşılır, `h1` ve `ozet` gerçek HTML metindir (LCP bunlardır).
- Telefon düzeni 390 px için ayrıca kurulur, masaüstü sıkıştırılmaz. 1280 px ve 1920 px'te satır uzunluğu sınırlanır (okuma ölçüsü ~65-75 karakter), boşluk dağılmaz.

## Tipografi ve renk
- Renkler ve aralıklar yalnız tasarım belirteçleri (CSS değişkeni) üzerinden. Sabit hex/px bileşene yazılmaz; renk rolü adıyla (zemin, mürekkep, soluk, çizgi, vurgu).
- Gövde 18 px, satır aralığı 1.45-1.6. Küçük arayüz yazısı (etiket, alt yazı) en az 14 px ve kontrastı AA'yı geçer.
- Akıcı ölçek (`clamp`), başlıkta boyuta göre sıkı iz aralığı. Tek font ailesi (Plus Jakarta Sans), sitede barındırılan woff2, `font-display: swap`, en çok 4 dosya, en çok 2'si preload. CLS çıkarsa yedek font ölçüleri eşlenir.
- Tek köşe yarıçapı kuralı. Tek kolon ızgara, hizalama kuralı belli. Bölüm ritmi değişir (üç eşit kart sırası üst üste kullanılmaz).
- Koyu ve açık tema birlikte tasarlanır. Zemin değişiyorsa tüm metin rengi tek değişkenden akar; her sayfanın sonu iki temada okunaklı olmalı.

## Etkileşim ve hareket
- Dokunma hedefi ≥ 48 px. Dokunmatikte hiçbir şey hover'a bağlı olmaz; hover içeriği odakta da açılır.
- Her etkileşimli öğenin hover, `:focus-visible` ve aktif durumu vardır ve sistemin parçasıdır. Birincil hedefte yalnız renk değişimi yetmez (iz, dolgu, kayma gibi tek bir ortak işlem).
- Odak halkası her yerde görünür; atla bağlantısı ilk sırada; menü Escape ile kapanır, odak geri döner.
- Hareket yalnız `transform`, `opacity`, `clip-path`. Düzen özelliği (width/height/top) animasyonlanmaz. Büyük şey yavaş, küçük şey hızlı; tek easing ailesi.
- `prefers-reduced-motion`: animasyon kapalı, içerik tam görünür. Bu hâl bilinçli tasarlanır.
- Yerel imleç hep görünür. Kaydırma ele geçirilmez.

## Anlamsal yapı ve erişilebilirlik
- Sayfada bir `h1`, sıralı başlıklar, `header/nav/main/footer`, liste liste olarak, eylem düğme, gezinme bağlantı.
- Metin gerçek metindir (görsele, canvas'a gömülmez). Süs amaçlı metin kopyaları başlık/bağlantı dışında ve `aria-hidden="true"`.
- Görsellerde `width`/`height` (ya da `aspect-ratio`), kıvrım altında `loading="lazy"`, ilk ekran görselinde `fetchpriority="high"`, `decoding="async"`, açıklayıcı `alt`.
- Sabit konumlu arayüz içerikle çakışmaz; görselin üstündeki sabit metin okunur kalır (zemin perdesi).
- Kontrast AA: gövde 4.5:1, büyük metin 3:1; görsel üstündeki metin dahil.

## Başarım hedefleri (üretim derlemesinde ölçülür, `npm run build` çıktısı)
- Telefonda LCP < 2.5 sn, CLS < 0.05, INP < 200 ms. Adacık (React) eklemek bunları kötüleştiriyorsa eklenmez; metin zaten sunucuda basılıdır.
- Hareket gerektiren her ek kütüphane (animasyon, kaydırma, WebGL) bu sitede kullanılmaz; gerekçe ve ölçüm olmadan bağımlılık eklenmez.

## Metin (arayüz yazısı)
- Cümle düzeni: ilk harf büyük, gerisi küçük. Aynı cümle iki bölümde tekrarlanmaz.
- Cihaza uygun dil: "üzerine gel" gibi fare ifadeleri yerine "dokun".
- Dolgu söz ve boş vaat yok ("harika deneyim", "sorunsuz"). Somut isim, doğru sayı.
- Uydurma kimlik, ödül, yorum, istatistik yok.

## Kaçınılacaklar (gerekçe yoksa)
- Gradyan lekesi üstünde ortalı hero, üç eşit özellik kartı, mor-mavi yapay zeka gradyanı, her yerde buzlu cam, her başlığın üstünde etiket, dizi olmayan içerikte 01/02/03.
- Yükleme perdesi, ekran kilitleyen kaydırma, imleç gizleme, yalnız yatay kaydırmalı galeri.

## Doğrulama (CLAUDE.md QA maddesine ek)
Playwright (üretim derlemesi, geliştirme sunucusu değil), 390 px ve 1280 px, koyu ve açık tema, ayrıca `prefers-reduced-motion`. Kontrol listesi:
- Konsol hatası yok, başarısız istek yok, yatay taşma yok.
- 48 px altı dokunma hedefi yok; her odak durağında halka görünür.
- Azaltılmış harekette gizli kalan metin yok.
- axe-core: ciddi ya da kritik ihlal yok.
- Her ekran görüntüsü gözle okunur: ilk ekran afiş gibi mi, sayfa sonu iki temada okunaklı mı.
- Uzun sayfada en alt bölüm ve 404 de çekilir; en kötü hatalar orada saklanır.

Bilinen tuzaklar: başlık içinde süs kopyası ("AD AD" okunur), mobilde büyük başlığın kelime ortasından bölünmesi (`nowrap` + `vw`/`cqi` ile 390 px'te doğrula), masaüstü `1fr` satırının telefonda boşluk açması (mobil satırları açık yaz), alt bilgi bağlantılarının küçük kalması.
