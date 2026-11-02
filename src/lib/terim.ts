// Metinde geçen terimleri bulur: her blokta her terimin ilk geçtiği yer dokunulabilir olur.
export type Parca = {metin: string; terim?: string};
export const terimId = (ad: string) => `terim-${ad.toLocaleLowerCase('tr').replace(/[^a-z0-9çğıöşü]+/g, '-')}`;

export function parcala(metin: string, adlar: string[]): Parca[] {
  if (!adlar.length) return [{metin}];
  const sirali = [...adlar].sort((a, b) => b.length - a.length);
  const kacis = sirali.map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`(?<![\\p{L}])(${kacis.join('|')})(?![\\p{L}])`, 'giu');
  const goruldu = new Set<string>();
  const out: Parca[] = [];
  let son = 0;
  for (const m of metin.matchAll(re)) {
    const ad = sirali.find((a) => a.toLocaleLowerCase('tr') === m[0].toLocaleLowerCase('tr'));
    if (!ad || goruldu.has(ad)) continue;
    goruldu.add(ad);
    if (m.index > son) out.push({metin: metin.slice(son, m.index)});
    out.push({metin: m[0], terim: ad});
    son = m.index + m[0].length;
  }
  if (son < metin.length) out.push({metin: metin.slice(son)});
  return out;
}
