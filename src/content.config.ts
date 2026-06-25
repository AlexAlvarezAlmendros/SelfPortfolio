import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/blog',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    lang: z.enum(['es', 'en']),
    tag: z.string(),
    date: z.coerce.date(),
    read: z.string(),
    excerpt: z.string(),
    order: z.number(),
  }),
});

const projects = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/projects',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    lang: z.enum(['es', 'en']),
    label: z.string(),
    year: z.string(),
    url: z.string(),
    live: z.string().url(),
    repo: z.string().url(),
    tags: z.array(z.string()),
    tagline: z.string(),
    role: z.string(),
    overview: z.string(),
    features: z.array(z.string()),
    order: z.number(),
  }),
});

export const collections = { blog, projects };
