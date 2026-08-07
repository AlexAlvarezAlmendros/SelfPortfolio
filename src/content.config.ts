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
    /** Last meaningful edit. Feeds dateModified + sitemap lastmod. Defaults to `date`. */
    updated: z.coerce.date().optional(),
    read: z.string(),
    excerpt: z.string(),
    order: z.number(),
    /** SERP title (~60 chars). Overrides the on-page title in <title>/og:title only. */
    seoTitle: z.string().optional(),
    /** SERP description (~150 chars), written to earn the click. Falls back to `excerpt`. */
    seoDesc: z.string().optional(),
    /** Slug of a project this post is about — renders a cross-link. */
    relatedProject: z.string().optional(),
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
    /** SERP title (~60 chars). Overrides the on-page name in <title>/og:title only. */
    seoTitle: z.string().optional(),
    /** SERP description (~150 chars), written to earn the click. Falls back to `tagline`. */
    seoDesc: z.string().optional(),
    /** Slug of a blog post about this project — renders a cross-link. */
    relatedPost: z.string().optional(),
  }),
});

export const collections = { blog, projects };
