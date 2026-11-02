// Konu paketlerinin anlam kontrolü (şema ayrıca yukle.ts'te). Saf fonksiyon: dosya okumaz, test edilebilir.
// Denklem dengesi, terim sözlüğü, iddia bütçesi, okunabilirlik, bağlantılar, kısa link çakışması.
import type {Konu} from './schema.ts';
import {denge, SOZLUK} from './kimya.ts';
import {kisaLink} from './yol.ts';

export type Sonuc = {hatalar: string[]; uyarilar: string[]};

const CUMLE_SINIRI = 25; // kelime; orta düzey lise öğrencisi için

export function denetle(paketler: {dosya: string; k: Konu}[]): Sonuc {
  const hatalar: string[] = [];
  const uyarilar: string[] = [];

  for (const {dosya, k} of paketler) {
    const h = (m: string) => hatalar.push(`${dosya}: ${m}`);
    const u = (m: string) => uyarilar.push(`${dosya}: ${m}`);

    if (`${k.id}.json` !== dosya) h(`id dosya adıyla aynı olmalı (${k.id})`);
    if (k.yayin > k.guncelleme) h(`yayin (${k.yayin}) guncelleme tarihinden (${k.guncelleme}) sonra olamaz`);

    // 1) Denklem dengesi: kural, görsel adımları, örnek çözüm, hesap iddiaları
    const denklemler: [string, string][] = [['kural.formul', k.kural.formul]];
    k.gorsel.adimlar.forEach((a, i) => {
      if (a.denklem) denklemler.push([`gorsel.adim ${i + 1}`, `${a.sol.map((t) => t.f).join(' + ')} → ${a.sag.map((t) => t.f).join(' + ')}`]);
    });
    k.ornek.adimlar.forEach((a, i) => a.formul?.includes('→') && denklemler.push([`ornek.adim ${i + 1}`, a.formul]));
    k.iddialar.forEach((d) => d.yontem === 'hesap' && d.hesap && denklemler.push([`iddia ${d.id}`, d.hesap]));
    for (const [yer, d] of denklemler) {
      try {
        const s = denge(d);
        if (!s.dengeli) h(`${yer} dengesiz: "${d}" (${s.neden})`);
      } catch (e) {
        h(`${yer} okunamadı: ${(e as Error).message}`);
      }
    }

    // 2) Terimler: sözlükteki formülle aynı olmalı; metinde geçen her kimyasal ad terimlerde olmalı
    const terimAd = new Set(k.terimler.map((t) => t.ad.toLocaleLowerCase('tr')));
    for (const t of k.terimler) {
      const s = SOZLUK[t.ad.toLocaleLowerCase('tr')];
      if (s && t.formul && s !== t.formul) h(`terim "${t.ad}" formülü ${t.formul}, sözlükte ${s}`);
      if (!s && t.formul) u(`terim "${t.ad}" sözlükte yok; src/konu/kimya.ts SOZLUK'a ekle`);
    }
    const metin = JSON.stringify([k.ozet, k.tahmin, k.gorsel, k.kural, k.neden, k.sikHata, k.ornek, k.sorular, k.kartlar]).toLocaleLowerCase('tr');
    for (const ad of Object.keys(SOZLUK)) {
      if (metin.includes(ad) && !terimAd.has(ad)) h(`metinde "${ad}" geçiyor ama terimler listesinde yok`);
    }

    // 3) İddia bütçesi ve teyit durumu
    for (const d of k.iddialar) {
      if (d.yontem === 'kaynak' && !d.kaynak) h(`iddia ${d.id}: kaynak yöntemi seçilmiş ama kaynak yok`);
      if (d.yontem === 'hesap' && !d.hesap) h(`iddia ${d.id}: hesap yöntemi seçilmiş ama hesap yok`);
      if (d.durum === 'yanlis' || d.durum === 'belirsiz') h(`iddia ${d.id} ${d.durum}: yayınlanamaz`);
      if (d.durum === 'bekliyor') u(`iddia ${d.id} teyit bekliyor`);
    }

    // 4) Okunabilirlik: uzun cümle uyarısı (özet, neden, sık hata, SSS cevapları)
    const metinler = [k.ozet, ...k.neden.map((n) => n.metin), k.sikHata.dogru, k.sikHata.neden, ...k.sorular.map((s) => s.cevap)];
    for (const c of metinler.join(' ').split(/(?<=[.!?])\s+/)) {
      const n = c.split(/\s+/).filter(Boolean).length;
      if (n > CUMLE_SINIRI) u(`uzun cümle (${n} kelime): "${c.slice(0, 60)}…"`);
    }

    // 5) Seçenek indeksleri
    if (k.ornek.dogru >= k.ornek.secenekler.length) h('ornek.dogru seçenek sayısını aşıyor');
  }

  // 6) Bağlantılar ve kısa link çakışması
  const idler = new Set(paketler.map((p) => p.k.id));
  const seri = new Map<string, string>();
  for (const {k} of paketler) {
    for (const b of [...k.onBilgi, ...k.sonraki]) if (!idler.has(b)) hatalar.push(`${k.id}: bağlantı "${b}" yok`);
    const kisa = kisaLink(k);
    if (kisa) {
      if (seri.has(kisa)) hatalar.push(`kısa link ${kisa} iki pakette: ${seri.get(kisa)}, ${k.id}`);
      seri.set(kisa, k.id);
    }
  }

  return {hatalar, uyarilar};
}
