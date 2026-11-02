import {defineCollection} from 'astro:content';
import {glob} from 'astro/loaders';
import {KonuSchema} from './konu/schema';

const konu = defineCollection({
  loader: glob({pattern: '*.json', base: './konu'}),
  schema: KonuSchema,
});

export const collections = {konu};
