import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = (await getCollection('blog', (e) => e.data.lang === 'es')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
  return rss({
    title: 'Alex Alvarez Almendros — Blog & Devlogs',
    description:
      'Notas técnicas, decisiones de arquitectura y aprendizajes sobre .NET, React, automatización de procesos e IA.',
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.excerpt,
      pubDate: p.data.date,
      link: `/blog/${p.data.slug}/`,
      categories: [p.data.tag],
    })),
    customData: '<language>es-ES</language>',
  });
}
