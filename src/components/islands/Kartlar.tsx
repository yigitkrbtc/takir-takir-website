import {useEffect, useMemo, useState} from 'react';

type Kart = {id: string; on: string; arka: string; tur: string};
type Props = {konuId: string; kartlar: Kart[]};
type Kayit = Record<string, {kutu: number; sonraki: string}>;

// Aralıklı tekrar (Leitner): bilinen kart daha seyrek, bilinmeyen hemen tekrar gelir.
const ARALIK = [0, 1, 3, 7, 16]; // gün
const bugun = () => new Date().toISOString().slice(0, 10);
const gunEkle = (n: number) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const TUR_AD: Record<string, string> = {tanim: 'Tanım', formul: 'Formül', hata: 'Sık hata', uygulama: 'Uygula'};

function oku<T>(anahtar: string, varsayilan: T): T {
  try {
    const v = localStorage.getItem(anahtar);
    return v ? (JSON.parse(v) as T) : varsayilan;
  } catch {
    return varsayilan;
  }
}
function yaz(anahtar: string, v: unknown) {
  try { localStorage.setItem(anahtar, JSON.stringify(v)); } catch {}
}

// Çalışılan günler → kesintisiz gün serisi
function seriHesapla(gunler: string[]) {
  const set = new Set(gunler);
  let n = 0;
  for (let d = 0; set.has(gunEkle(-d)); d++) n++;
  return n;
}

export default function Kartlar({konuId, kartlar}: Props) {
  const anahtar = `kart:${konuId}`;
  const [kayit, setKayit] = useState<Kayit>({});
  const [sira, setSira] = useState<Kart[]>(kartlar);
  const [cevrildi, setCevrildi] = useState(false);
  const [sonuc, setSonuc] = useState({bildi: 0, emin: 0, bilmedi: 0});
  const [seri, setSeri] = useState(0);
  const [hazir, setHazir] = useState(false);

  useEffect(() => {
    const k = oku<Kayit>(anahtar, {});
    setKayit(k);
    const vadesi = kartlar.filter((x) => !k[x.id] || k[x.id].sonraki <= bugun());
    setSira(vadesi.length ? vadesi : kartlar);
    setSeri(seriHesapla(oku<string[]>('seri', [])));
    setHazir(true);
  }, [anahtar, kartlar]);

  const kart = sira[0];
  const toplam = kartlar.length;
  const bitti = hazir && !kart;
  const ustune = useMemo(() => toplam - sira.length, [toplam, sira.length]);

  function cevap(c: 'bildi' | 'emin' | 'bilmedi') {
    if (!kart) return;
    const eski = kayit[kart.id]?.kutu ?? 0;
    const kutu = c === 'bildi' ? Math.min(ARALIK.length - 1, eski + 1) : c === 'emin' ? eski : 0;
    const yeni = {...kayit, [kart.id]: {kutu, sonraki: gunEkle(c === 'bilmedi' ? 0 : Math.max(1, ARALIK[kutu]))}};
    setKayit(yeni);
    yaz(anahtar, yeni);
    const gunler = oku<string[]>('seri', []);
    if (!gunler.includes(bugun())) {
      const g = [...gunler, bugun()].slice(-60);
      yaz('seri', g);
      setSeri(seriHesapla(g));
    }
    setSonuc((s) => ({...s, [c]: s[c] + 1}));
    setCevrildi(false);
    // bilinmeyen kart destenin sonuna döner, bu oturumda tekrar gelir
    setSira((s) => (c === 'bilmedi' ? [...s.slice(1), s[0]] : s.slice(1)));
  }

  if (bitti) {
    const tekrar = kartlar.filter((x) => (kayit[x.id]?.kutu ?? 0) <= 1).length;
    return (
      <div className="kart kartlar-son">
        <p className="buyuk-sayi">{sonuc.bildi}<span>/{toplam}</span></p>
        <p><strong>Desteyi bitirdin.</strong> {tekrar ? `${tekrar} kart yarın tekrar gelecek.` : 'Hepsini biliyorsun, birkaç gün sonra tekrar bak.'}</p>
        {seri > 0 && <p className="seri">{seri} gün üst üste çalıştın</p>}
        <button type="button" className="dugme" onClick={() => { setSira(kartlar); setSonuc({bildi: 0, emin: 0, bilmedi: 0}); }}>Baştan çalış</button>
      </div>
    );
  }

  return (
    <div className="kartlar">
      <div className="kartlar-ust">
        <span className="ince kucuk">{Math.min(ustune + 1, toplam)} / {toplam}</span>
        {seri > 0 && <span className="seri kucuk">{seri} gün seri</span>}
      </div>
      {kart && (
        <button type="button" className={`flash ${cevrildi ? 'cevrildi' : ''}`} onClick={() => setCevrildi(!cevrildi)} aria-label={cevrildi ? 'Kartın ön yüzüne dön' : 'Kartı çevir, cevabı gör'}>
          <span className="flash-ic">
            <span className="yuz on">
              <span className="kart-tur">{TUR_AD[kart.tur] ?? kart.tur}</span>
              <span className="kart-metin">{kart.on}</span>
              <span className="ince kucuk">Cevabı düşün, sonra dokun</span>
            </span>
            <span className="yuz arka" aria-hidden={!cevrildi}>
              <span className="kart-tur">Cevap</span>
              <span className="kart-metin">{kart.arka}</span>
            </span>
          </span>
        </button>
      )}
      <div className={`kart-cevap ${cevrildi ? 'gorunur' : ''}`} role="group" aria-label="Ne kadar biliyordun?">
        <button type="button" className="dugme bilmedi" disabled={!cevrildi} onClick={() => cevap('bilmedi')}>Bilmiyordum</button>
        <button type="button" className="dugme emin" disabled={!cevrildi} onClick={() => cevap('emin')}>Emin değilim</button>
        <button type="button" className="dugme bildi" disabled={!cevrildi} onClick={() => cevap('bildi')}>Biliyordum</button>
      </div>
      <details className="tum-kartlar">
        <summary>Tüm kartları liste olarak gör</summary>
        <dl>
          {kartlar.map((x) => (
            <div key={x.id}><dt>{x.on}</dt><dd>{x.arka}</dd></div>
          ))}
        </dl>
      </details>
    </div>
  );
}
