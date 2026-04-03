import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(), // "2026-04"
    description: z.string(),
    lang: z.enum(['en', 'zh']),
  }),
});

export const collections = { blog };
