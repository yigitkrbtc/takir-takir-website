// Marka işaretinin tek kaynağı: iki klavye tuşu (T T), ikincisi basılı. "Takır takır" yazma sesi.
// Yalnız yol (path) kullanır, font gerektirmez: favicon, uygulama ikonları, OG kartı ve sayfa başlığı aynı çizimi kullanır.
export const RENK = {zemin: '#0E1117', sari: '#F5B83D', golge: '#B3821F', murekkep: '#14110A', beyaz: '#F5F1E8'} as const;

// Tek tuş: x konumu, basılma miktarı (0 yukarıda, 1 tam basılı)
function tus(x: number, basili: number) {
  const y = 2 + basili * 3;
  const derinlik = 4 - basili * 3;
  return [
    `<rect x="${x}" y="${y + derinlik}" width="26" height="28" rx="7" fill="${RENK.golge}"/>`,
    `<rect x="${x}" y="${y}" width="26" height="28" rx="7" fill="${RENK.sari}"/>`,
    // T: üst çubuk + gövde
    `<rect x="${x + 6.5}" y="${y + 7}" width="13" height="4.6" rx="1.6" fill="${RENK.murekkep}"/>`,
    `<rect x="${x + 10.7}" y="${y + 7}" width="4.6" height="15" rx="1.6" fill="${RENK.murekkep}"/>`,
  ].join('');
}

const TUSLAR = `${tus(1, 0)}${tus(31, 1)}`;

// Başlık ve OG için: 58×36, şeffaf zemin
export const isaretSvg = (genislik = 58) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 36" width="${genislik}" height="${(genislik * 36) / 58}" aria-hidden="true">${TUSLAR}</svg>`;

// İkonlar için: kare, koyu zemin. pay = kenar boşluğu oranı (maskable ikonlar daha geniş boşluk ister)
export function ikonSvg(boyut: number, pay = 0.16, yuvarlak = true) {
  const ic = 58;
  const olcek = (1 - pay * 2) * (64 / ic);
  const tx = (64 - ic * olcek) / 2;
  const ty = (64 - 36 * olcek) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${boyut}" height="${boyut}">` +
    `<rect width="64" height="64" rx="${yuvarlak ? 14 : 0}" fill="${RENK.zemin}"/>` +
    `<g transform="translate(${tx} ${ty}) scale(${olcek})">${TUSLAR}</g></svg>`;
}
