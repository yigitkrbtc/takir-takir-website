import {useState} from 'react';

type Props = {soru: string; secenekler: string[]; dogru: number; adimlar: {metin: string; formul?: string}[]; puf?: string};

// Çözümlü örnek: önce öğrenci dener, sonra çözüm adım adım açılır (bölümleme).
export default function Ornek({soru, secenekler, dogru, adimlar, puf}: Props) {
  const [secim, setSecim] = useState<number | null>(null);
  const [acik, setAcik] = useState(0);
  const harf = (i: number) => String.fromCharCode(65 + i);
  return (
    <div className="kart ornek">
      <p className="ornek-soru">{soru}</p>
      <div className="secenekler" role="group" aria-label="Seçenekler">
        {secenekler.map((s, i) => {
          const durum = secim === null ? '' : i === dogru ? 'dogru' : i === secim ? 'yanlis' : 'sonuk';
          return (
            <button key={s} type="button" className={`secenek ${durum}`} disabled={secim !== null} onClick={() => { setSecim(i); setAcik(1); }}>
              <span className="secenek-harf">{harf(i)}</span>
              <span className="formul">{s}</span>
            </button>
          );
        })}
      </div>
      {secim === null && (
        <div className="once-dene">
          <span>Önce sen dene. Bir seçeneğe dokun ya da</span>
          <button type="button" className="metin-dugme" onClick={() => setAcik(1)}>çözüme geç</button>
        </div>
      )}
      {secim !== null && (
        <p className={`geri-bildirim ${secim === dogru ? 'iyi' : 'kotu'}`} role="status">
          <strong>{secim === dogru ? 'Doğru.' : `Doğrusu ${harf(dogru)}.`}</strong> Neden böyle olduğuna adım adım bakalım.
        </p>
      )}
      {acik > 0 && (
        <ol className="cozum">
          {adimlar.slice(0, acik).map((a, i) => (
            <li key={i} className="cozum-adim">
              <span className="cozum-no">{i + 1}</span>
              <div>
                <p>{a.metin}</p>
                {a.formul && <p className="formul vurgu-formul">{a.formul}</p>}
              </div>
            </li>
          ))}
        </ol>
      )}
      {acik > 0 && acik < adimlar.length && (
        <button type="button" className="dugme ana" onClick={() => setAcik(acik + 1)}>Sonraki adım ({acik + 1}/{adimlar.length})</button>
      )}
      {acik >= adimlar.length && puf && (
        <p className="puf"><strong>Püf noktası:</strong> {puf}</p>
      )}
    </div>
  );
}
