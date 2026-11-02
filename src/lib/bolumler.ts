// Konu sayfasının bölüm sırası: numaralar, başlıklar ve üstteki "bu derste" yolu buradan üretilir.
import type {Konu} from '../konu/schema';

export type Bolum = {id: string; no: number; yol: string; baslik: string};

export function konuBolumleri(k: Konu): Bolum[] {
  const sira: Omit<Bolum, 'no'>[] = [
    {id: 'tahmin', yol: 'Tahmin et', baslik: 'Önce tahmin et'},
    {id: 'gor', yol: 'Gör', baslik: `Gör: ${k.gorsel.baslik}`},
    {id: 'kural', yol: 'Kural', baslik: 'Kural'},
    {id: 'neden', yol: 'Neden', baslik: 'Neden böyle?'},
    {id: 'ornek', yol: 'Örnek', baslik: 'Çözümlü örnek'},
    {id: 'hata', yol: 'Sık hata', baslik: 'Sık yapılan hata'},
    {id: 'kartlar', yol: 'Kendini test et', baslik: 'Kendini test et'},
    {id: 'sorular', yol: 'Sorular', baslik: 'Sık sorulan sorular'},
  ];
  return sira.map((b, i) => ({...b, no: i + 1}));
}
