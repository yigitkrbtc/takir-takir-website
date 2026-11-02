import {useEffect, useState} from 'react';
import {ANAHTAR, oku, yaz} from '../../lib/depo';
import {bugunuEkle, seriUzunlugu, sonrakiKayit, vadesiGelen, type Cevap, type KartKaydi} from '../../lib/tekrar';

type Kart = {id: string; on: string; arka: string; tur: string};
type Props = {konuId: string; kartlar: Kart[]};
type Kayit = Record<string, KartKaydi>;

const TUR_AD: Record<string, string> = {tanim: 'Tanım', formul: 'Formül', hata: 'Sık hata', uygulama: 'Uygula'};

// Flash kartlar + aralıklı tekrar. Bilinen kart daha seyrek, bilinmeyen hemen tekrar gelir (kurallar: lib/tekrar.ts).
export default function Kartlar({konuId, kartlar}: Props) {
  const anahtar = ANAHTAR.kart(konuId);
  const [kayit, setKayit] = useState<Kayit>({});
  const [sira, setSira] = useState<Kart[]>(kartlar);
  const [cevrildi, setCevrildi] = useState(false);
  const [sonuc, setSonuc] = useState({bildi: 0, emin: 0, bilmedi: 0});
  const [seri, setSeri] = useState(0);
  const [hazir, setHazir] = useState(false);

  useEffect(() => {
    const k = oku<Kayit>(anahtar, {});
    setKayit(k);
    const vadesi = vadesiGelen(kartlar, k, new Date());
    setSira(vadesi.length ? vadesi : kartlar);
    setSeri(seriUzunlugu(oku<string[]>(ANAHTAR.seri, []), new Date()));
    setHazir(true);
  }, [anahtar, kartlar]);

  const kart = sira[0];
  const toplam = kartlar.length;
  const bitti = hazir && !kart;
  const ustune = toplam - sira.length;

  function cevap(c: Cevap) {
    if (!kart) return;
    const simdi = new Date();
    const yeni = {...kayit, [kart.id]: sonrakiKayit(kayit[kart.id], c, simdi)};
    setKayit(yeni);
    yaz(anahtar, yeni);
    const gunler = bugunuEkle(oku<string[]>(ANAHTAR.seri, []), simdi);
    yaz(ANAHTAR.seri, gunler);
    setSeri(seriUzunlugu(gunler, simdi));
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
