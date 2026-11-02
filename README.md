# Takır Takır web sitesi

YKS konularını etkileşimli derslerle anlatan statik site (Astro + React adacıkları).

```bash
npm ci
npm run dev        # http://localhost:4321
npm test           # birim testleri (kimya, denetim, adresler, aralıklı tekrar)
npm run build      # önce konu paketlerini kontrol eder, sonra dist/ üretir
```

Yeni konu: `konu/` altına şemaya uyan bir JSON ekle, `npm run kontrol` temiz geçmeli. Ayrıntı: `CLAUDE.md`.

Yayın: `SITE_URL` verilmezse build önizleme sayılır ve her sayfa `noindex` olur. Alan adı alınınca Cloudflare build ayarlarına `SITE_URL=https://<alan-adı>` eklenir.
