// Konu paketi kontrolü: build öncesi çalışır, hata varsa site yayınlanmaz.
// Şema sınırları + anlam kontrolleri: denklem dengesi, terim sözlüğü, iddia bütçesi, bağlantılar.
import {readdirSync, readFileSync} from 'node:fs';
import {KonuSchema, type Konu} from '../src/konu/schema.ts';
import {denge, SOZLUK} from '../src/konu/kimya.ts';

const DIZIN = new URL('../konu/', import.meta.url);
const dosyalar = readdirSync(DIZIN).filter((f) => f.endsWith('.json'));
const hatalar: string[] = [];
const uyarilar: string[] = [];
const paketler: Konu[] = [];

for (const f of dosyalar) {
  const ham = JSON.parse(readFileSync(new URL(f, DIZIN), 'utf8'));
  const r = KonuSchema.safeParse(ham);
  if (!r.success) {
    for (const i of r.error.issues) hatalar.push(`${f}: ${i.path.join('.')} → ${i.message}`);
    continue;
  }
  const k = r.data;
  paketler.push(k);
  const h = (m: string) => hatalar.push(`${f}: ${m}`);
  const u = (m: string) => uyarilar.push(`${f}: ${m}`);

  if (`${k.id}.json` !== f) h(`id dosya adıyla aynı olmalı (${k.id})`);

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
  const metin = JSON.stringify([k.ozet, k.tahmin, k.gorsel, k.kural, k.neden, k.sikHata, k.ornek, k.kartlar]).toLocaleLowerCase('tr');
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

  // 4) Okunabilirlik (orta düzey lise öğrencisi): uzun cümle uyarısı
  const cumleler = [k.ozet, ...k.neden.map((n) => n.metin), k.sikHata.dogru, k.sikHata.neden].join(' ').split(/(?<=[.!?])\s+/);
  for (const c of cumleler) {
    const n = c.split(/\s+/).filter(Boolean).length;
    if (n > 25) u(`uzun cümle (${n} kelime): "${c.slice(0, 60)}…"`);
  }

  // 5) Seçenek indeksleri
  if (k.ornek.dogru >= k.ornek.secenekler.length) h('ornek.dogru seçenek sayısını aşıyor');
}

// 6) Bağlantılar ve kısa link çakışması
const idler = new Set(paketler.map((k) => k.id));
const seri = new Map<string, string>();
for (const k of paketler) {
  for (const b of [...k.onBilgi, ...k.sonraki]) if (!idler.has(b)) hatalar.push(`${k.id}: bağlantı "${b}" yok`);
  if (k.medya.seriNo) {
    const kisa = `${k.sinav === 'TYT' ? 't' : 'a'}${k.medya.seriNo}`;
    if (seri.has(kisa)) hatalar.push(`kısa link /${kisa} iki pakette: ${seri.get(kisa)}, ${k.id}`);
    seri.set(kisa, k.id);
  }
}

for (const w of uyarilar) console.log(`uyarı  ${w}`);
for (const e of hatalar) console.log(`HATA   ${e}`);
console.log(`\n${paketler.length} paket, ${hatalar.length} hata, ${uyarilar.length} uyarı`);
if (hatalar.length) process.exit(1);
