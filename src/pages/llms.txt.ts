import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE = 'https://alexalvarez.dev';

// /llms.txt — curated, machine-readable map for LLMs (llmstxt.org).
export const GET: APIRoute = async () => {
  const projects = (await getCollection('projects', (e) => e.data.lang === 'es')).sort(
    (a, b) => a.data.order - b.data.order,
  );
  const posts = (await getCollection('blog', (e) => e.data.lang === 'es')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  const body = `# Alex Alvarez Almendros

> Programador Fullstack (.NET, React, JavaScript, Astro, Node.js) con más de 5 años de experiencia. Especializado en desarrollo web, automatización de procesos e implementación de IA. Disponible en remoto desde Barcelona (España).

## Perfil
- Nombre: Alex Alvarez Almendros
- Rol: Programador / Desarrollador Fullstack
- Stack: C#, .NET 8, React, Astro, Blazor, Node.js, JavaScript, TypeScript, SQL
- Servicios: desarrollo web a medida, automatización de procesos (n8n), implementación e integración de IA y LLMs
- Ubicación: Barcelona, España — trabajo en remoto
- Email: alexalmendrosal@gmail.com
- GitHub: https://github.com/AlexAlvarezAlmendros
- LinkedIn: https://www.linkedin.com/in/alexalvarezalmendros/
- Web (ES): ${SITE}/
- Web (EN): ${SITE}/en

## Proyectos
${projects.map((p) => `- [${p.data.name}](${SITE}/work/${p.data.slug}): ${p.data.tagline}`).join('\n')}

## Blog y devlogs
${posts.map((p) => `- [${p.data.title}](${SITE}/blog/${p.data.slug}): ${p.data.excerpt}`).join('\n')}

## Feeds
- RSS (ES): ${SITE}/rss.xml
- RSS (EN): ${SITE}/en/rss.xml
- Sitemap: ${SITE}/sitemap-index.xml
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
