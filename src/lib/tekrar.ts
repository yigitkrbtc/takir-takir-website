// Aralıklı tekrar (Leitner) ve gün serisi: saf fonksiyonlar, tarih dışarıdan verilir (test edilebilir).
export const ARALIK = [0, 1, 3, 7, 16]; // kutu → gün
export type Cevap = 'bildi' | 'emin' | 'bilmedi';
export type KartKaydi = {kutu: number; sonraki: string};

const gun = (t: Date) => t.toISOString().slice(0, 10);
export const gunEkle = (bugun: Date, n: number) => gun(new Date(bugun.getTime() + n * 864e5));

// Biliyordum: bir üst kutu. Emin değilim: aynı kutu. Bilmiyordum: başa, bugün tekrar.
export function sonrakiKayit(eski: KartKaydi | undefined, c: Cevap, bugun: Date): KartKaydi {
  const k = eski?.kutu ?? 0;
  const kutu = c === 'bildi' ? Math.min(ARALIK.length - 1, k + 1) : c === 'emin' ? k : 0;
  return {kutu, sonraki: gunEkle(bugun, c === 'bilmedi' ? 0 : Math.max(1, ARALIK[kutu]))};
}

export const vadesiGelen = <T extends {id: string}>(kartlar: T[], kayit: Record<string, KartKaydi>, bugun: Date) =>
  kartlar.filter((x) => !kayit[x.id] || kayit[x.id].sonraki <= gun(bugun));

// Bugünden geriye kesintisiz çalışılan gün sayısı
export function seriUzunlugu(gunler: string[], bugun: Date): number {
  const set = new Set(gunler);
  let n = 0;
  while (set.has(gunEkle(bugun, -n))) n++;
  return n;
}

export const bugunuEkle = (gunler: string[], bugun: Date) => (gunler.includes(gun(bugun)) ? gunler : [...gunler, gun(bugun)].slice(-60));
