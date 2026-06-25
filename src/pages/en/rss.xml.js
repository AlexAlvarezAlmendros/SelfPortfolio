import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = (await getCollection('blog', (e) => e.data.lang === 'en')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
  return rss({
    title: 'Alex Alvarez Almendros — Blog & Devlogs',
    description:
      'Technical notes, architecture decisions and learnings about .NET, React, process automation and AI.',
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.excerpt,
      pubDate: p.data.date,
      link: `/en/blog/${p.data.slug}/`,
      categories: [p.data.tag],
    })),
    customData: '<language>en-US</language>',
  });
}
