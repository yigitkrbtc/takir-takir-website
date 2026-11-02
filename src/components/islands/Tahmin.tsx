import {useState} from 'react';

type Props = {soru: string; secenekler: string[]; dogru: number; aciklama: string; devam?: {href: string; metin: string}};

// Ders başlamadan tahmin: yanlış cevap serbest, merak ve hatırlama için (ön test etkisi).
export default function Tahmin({soru, secenekler, dogru, aciklama, devam}: Props) {
  const [secim, setSecim] = useState<number | null>(null);
  const bitti = secim !== null;
  return (
    <div className="kart tahmin">
      <p className="tahmin-soru">{soru}</p>
      <div className="secenekler" role="group" aria-label="Seçenekler">
        {secenekler.map((s, i) => {
          const durum = !bitti ? '' : i === dogru ? 'dogru' : i === secim ? 'yanlis' : 'sonuk';
          return (
            <button key={s} type="button" className={`secenek ${durum}`} disabled={bitti} onClick={() => setSecim(i)} aria-pressed={secim === i}>
              <span className="secenek-harf">{String.fromCharCode(65 + i)}</span>
              <span>{s}</span>
              {bitti && i === dogru && <span className="isaret" aria-label="doğru cevap">✓</span>}
              {bitti && i === secim && i !== dogru && <span className="isaret" aria-label="senin cevabın">✗</span>}
            </button>
          );
        })}
      </div>
      {bitti ? (
        <div className={`geri-bildirim ${secim === dogru ? 'iyi' : 'kotu'}`} role="status">
          <strong>{secim === dogru ? 'Doğru tahmin.' : `Doğrusu ${String.fromCharCode(65 + dogru)}.`}</strong> {aciklama}
          {devam && <a className="devam" href={devam.href}>{devam.metin}</a>}
        </div>
      ) : (
        <p className="ince kucuk ipucu">Yanlış tahmin etmek de işe yarar: önce tahmin edip sonra öğrenen daha iyi hatırlar.</p>
      )}
    </div>
  );
}
