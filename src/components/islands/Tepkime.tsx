import {useEffect, useRef, useState} from 'react';

import {gazMi, turBilgisi, yukYaz} from '../../konu/kimya';

type Tur = {f: string; ad?: string};
type Adim = {baslik: string; sol: Tur[]; sag: Tur[]; not: string; yukGoster?: boolean; denklem?: boolean};
type Props = {adimlar: Adim[]};

function Kutu({t, gecikme, kabarcik}: {t: Tur; gecikme: number; kabarcik?: boolean}) {
  const {katsayi, govde, yuk} = turBilgisi(t.f);
  const sinif = yuk !== 0 ? 'iyon' : gazMi(t.f) ? 'gaz' : '';
  return (
    <div className={`tur ${sinif}`} style={{animationDelay: `${gecikme}ms`}}>
      {katsayi > 1 && <span className="katsayi">{katsayi}×</span>}
      <span className="tur-formul">{govde}</span>
      {t.ad && <span className="tur-ad">{t.ad}</span>}
      {yuk !== 0 && <span className={`yuk ${yuk > 0 ? 'arti' : 'eksi'}`}>{yukYaz(yuk)}</span>}
      {kabarcik && (
        <span className="kabarciklar" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => <i key={i} style={{left: `${14 + i * 17}%`, animationDelay: `${i * 0.35}s`}} />)}
        </span>
      )}
    </div>
  );
}

// Tepkime kiti: iyonlar, yükler, ok, ürünler adım adım. Başlık bölüm başlığındadır (Gorsel.astro).
// Ayrıştırma src/konu/kimya.ts'ten gelir: kontrol betiği hangi kuralla doğruluyorsa görsel de onunla çizer.
export default function Tepkime({adimlar}: Props) {
  const [i, setI] = useState(0);
  const [oynuyor, setOynuyor] = useState(false);
  const zaman = useRef<number | undefined>(undefined);
  const a = adimlar[i];
  const denklem = a.denklem !== false;

  useEffect(() => {
    if (!oynuyor) return;
    zaman.current = window.setTimeout(() => {
      if (i < adimlar.length - 1) setI(i + 1);
      else setOynuyor(false);
    }, 4200);
    return () => window.clearTimeout(zaman.current);
  }, [oynuyor, i, adimlar.length]);

  const yukToplam = (ts: Tur[]) => ts.map((t) => turBilgisi(t.f)).filter((x) => x.yuk !== 0);
  const solYuk = yukToplam(a.sol);
  const toplam = solYuk.reduce((s, x) => s + x.katsayi * x.yuk, 0);

  return (
    <div className="kart tepkime">
      <div className="tepkime-ust">
        <span className="ince kucuk">Adım {i + 1} / {adimlar.length}</span>
        <span className="lejant kucuk" aria-label="Renkler">
          <span className="lj iyon">iyon</span>
          <span className="lj gaz">gaz</span>
        </span>
      </div>
      <ol className="adim-noktalari" aria-label="Adımlar">
        {adimlar.map((x, j) => (
          <li key={x.baslik}>
            <button type="button" className={j === i ? 'aktif' : j < i ? 'gecti' : ''} onClick={() => { setOynuyor(false); setI(j); }} aria-current={j === i ? 'step' : undefined}>
              <span className="sr">{x.baslik}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="sahne" key={i}>
        <p className="adim-baslik">{a.baslik}</p>
        <div className={`denklem ${denklem ? '' : 'durum'}`}>
          <div className="taraf">
            {a.sol.map((t, j) => (
              <div className="tur-kap" key={t.f + j}>
                {j > 0 && <span className="arti-isaret">+</span>}
                <Kutu t={t} gecikme={j * 120} />
              </div>
            ))}
          </div>
          <div className={`ok ${denklem ? '' : 'yok'}`} aria-hidden={!denklem}>
            {denklem ? (
              <svg viewBox="0 0 64 24" width="64" height="24"><path className="ok-cizgi" d="M2 12 H58" /><path className="ok-uc" d="M50 4 L60 12 L50 20" /></svg>
            ) : (
              <span className="arti-isaret">+</span>
            )}
          </div>
          <div className="taraf">
            {a.sag.map((t, j) => (
              <div className="tur-kap" key={t.f + j}>
                {j > 0 && <span className="arti-isaret">+</span>}
                <Kutu t={t} gecikme={(denklem ? 700 : 150) + j * 160} kabarcik={denklem && gazMi(t.f)} />
              </div>
            ))}
          </div>
        </div>
        {a.yukGoster && solYuk.length > 0 && (
          <p className="yuk-hesap">
            Yük: {solYuk.map((x, j) => <span key={j}>{j > 0 && ' + '}{x.katsayi > 1 ? `${x.katsayi}·(${yukYaz(x.yuk)})` : `(${yukYaz(x.yuk)})`}</span>)} = <strong>{yukYaz(toplam)}</strong>
          </p>
        )}
        <p className="adim-not">{a.not}</p>
      </div>
      <div className="tepkime-kontrol">
        <button type="button" className="dugme" onClick={() => { setOynuyor(false); setI(Math.max(0, i - 1)); }} disabled={i === 0}>← Geri</button>
        <button type="button" className="dugme" onClick={() => { if (i === adimlar.length - 1) setI(0); setOynuyor(!oynuyor); }} aria-pressed={oynuyor}>{oynuyor ? 'Durdur' : 'Oynat'}</button>
        <button type="button" className="dugme ana" onClick={() => { setOynuyor(false); setI(Math.min(adimlar.length - 1, i + 1)); }} disabled={i === adimlar.length - 1}>İleri →</button>
      </div>
    </div>
  );
}
