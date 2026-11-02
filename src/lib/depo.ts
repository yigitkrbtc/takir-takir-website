// Tarayıcı depolamasının tek kapısı. Anahtarlar sürümlü önekle: şema değişirse önek artar, eski veri bozmaz.
// Gizli sekme, kapalı depolama ya da kota hatası sessizce varsayılana düşer; sayfa depo olmadan da çalışır.
export const ONEK = 'tt:v1:';

export const ANAHTAR = {
  tema: `${ONEK}tema`, // Base.astro içindeki satır içi betik bu değeri birebir kullanır
  seri: `${ONEK}seri`,
  kart: (konuId: string) => `${ONEK}kart:${konuId}`,
} as const;

export function oku<T>(anahtar: string, varsayilan: T): T {
  try {
    const v = globalThis.localStorage?.getItem(anahtar);
    return v ? (JSON.parse(v) as T) : varsayilan;
  } catch {
    return varsayilan;
  }
}

export function yaz(anahtar: string, deger: unknown): void {
  try {
    globalThis.localStorage?.setItem(anahtar, JSON.stringify(deger));
  } catch {}
}
