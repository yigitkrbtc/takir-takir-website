// Sayfaların konu erişimi: içerik koleksiyonu (şema src/konu/schema.ts), en yeni önce.
import {getCollection} from 'astro:content';
import type {Konu} from '../konu/schema';

export async function tumKonular(): Promise<Konu[]> {
  return (await getCollection('konu')).map((e) => e.data).sort((a, b) => b.guncelleme.localeCompare(a.guncelleme) || a.id.localeCompare(b.id));
}

export const ogYolu = (k?: {id: string}) => `/og/${k ? k.id : 'site'}.png`;
