import {defineCollection} from 'astro:content';
import {glob} from 'astro/loaders';
import {KonuSchema} from './konu/schema';
import {KONU_DIZINI} from './konu/yukle';

const konu = defineCollection({
  loader: glob({pattern: '*.json', base: KONU_DIZINI}),
  schema: KonuSchema,
});

export const collections = {konu};
