import type { Lang } from '../i18n/ui';

const SITE = 'https://www.alexalvarez.dev';
const PERSON_ID = `${SITE}/#person`;
const REMOTE = { '@type': 'Place', name: 'Worldwide (remote / en remoto)' } as const;

/** A service the person offers, wrapped in an Offer for schema.org makesOffer. */
function serviceOffer(name: string, description: string) {
  return {
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Service',
      name,
      serviceType: name,
      description,
      provider: { '@id': PERSON_ID },
      areaServed: REMOTE,
    },
  };
}

export function personNode(lang: Lang = 'es') {
  const es = lang === 'es';
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Alex Alvarez Almendros',
    alternateName: ['Alex Alvarez', 'Alex Álvarez Almendros', 'Alex Almendros'],
    url: 'https://www.alexalvarez.dev/',
    image: 'https://www.alexalvarez.dev/og-image.png',
    jobTitle: es ? 'Programador Fullstack' : 'Fullstack Developer',
    email: 'alexalmendrosal@gmail.com',
    description: es
      ? 'Programador Fullstack con más de 5 años construyendo soluciones web y móviles con React, Blazor, NodeJS, JavaScript, Astro y .NET 8. Especializado en automatización de procesos e implementación de IA. Disponible en remoto.'
      : 'Fullstack developer with 5+ years building web and mobile solutions with React, Blazor, NodeJS, JavaScript, Astro and .NET 8. Focused on process automation and AI implementation. Available remote.',
    address: { '@type': 'PostalAddress', addressLocality: 'Barcelona', addressCountry: 'ES' },
    workLocation: REMOTE,
    worksFor: { '@type': 'Organization', name: 'Capitole Consulting' },
    knowsAbout: [
      'C#',
      '.NET',
      'React',
      'Blazor',
      'Node.js',
      'JavaScript',
      'TypeScript',
      'Astro',
      'SQL',
      'Auth0',
      'IoT',
      'n8n',
      'LLMOps',
      es ? 'Inteligencia Artificial' : 'Artificial Intelligence',
      es ? 'Implementación de IA' : 'AI implementation',
      es ? 'Automatización de procesos' : 'Process automation',
      es ? 'Desarrollo web' : 'Web development',
    ],
    knowsLanguage: ['es', 'en'],
    makesOffer: es
      ? [
          serviceOffer(
            'Desarrollo web a medida',
            'Aplicaciones web y móviles con React, Blazor, .NET y Node.js.',
          ),
          serviceOffer(
            'Automatización de procesos',
            'Automatización de procesos de negocio con n8n, integraciones y APIs.',
          ),
          serviceOffer(
            'Implementación de IA',
            'Integración e implementación de IA y LLMs en producto y operaciones.',
          ),
        ]
      : [
          serviceOffer(
            'Custom web development',
            'Web and mobile apps with React, Blazor, .NET and Node.js.',
          ),
          serviceOffer(
            'Process automation',
            'Business process automation with n8n, integrations and APIs.',
          ),
          serviceOffer(
            'AI implementation',
            'Integrating and shipping AI and LLMs into product and operations.',
          ),
        ],
    sameAs: [
      'https://github.com/AlexAlvarezAlmendros',
      'https://www.linkedin.com/in/alexalvarezalmendros/',
    ],
  };
}

/** Build a BreadcrumbList from ordered { name, url } crumbs. */
export function breadcrumbNode(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/** Wrap nodes in a schema.org graph document. */
function graph(nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}

const homeUrl = (lang: Lang) => `${SITE}${lang === 'es' ? '/' : '/en'}`;

export function homeJsonLd(lang: Lang, url: string) {
  return graph([
    personNode(lang),
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      url,
      name: 'Alex Alvarez Almendros — Fullstack Developer',
      inLanguage: lang,
      author: { '@id': PERSON_ID },
    },
    {
      '@type': 'ProfilePage',
      '@id': `${url}#profilepage`,
      url,
      name: 'Alex Alvarez Almendros',
      inLanguage: lang,
      isPartOf: { '@id': `${SITE}/#website` },
      mainEntity: { '@id': PERSON_ID },
    },
  ]);
}

export function articleJsonLd(opts: {
  lang: Lang;
  url: string;
  title: string;
  description: string;
  date: Date;
  updated?: Date;
  /** Post-specific social card, e.g. '/og/es/linux.png'. */
  image?: string;
  /** Editorial section, e.g. 'HOMELAB'. */
  section?: string;
  wordCount?: number;
}) {
  const es = opts.lang === 'es';
  const blogUrl = `${SITE}${es ? '/blog' : '/en/blog'}`;
  return graph([
    {
      '@type': 'BlogPosting',
      headline: opts.title,
      description: opts.description,
      inLanguage: opts.lang,
      datePublished: opts.date.toISOString(),
      dateModified: (opts.updated ?? opts.date).toISOString(),
      mainEntityOfPage: opts.url,
      url: opts.url,
      image: new URL(opts.image ?? '/og-image.png', SITE).href,
      ...(opts.section ? { articleSection: opts.section, keywords: opts.section } : {}),
      ...(opts.wordCount ? { wordCount: opts.wordCount } : {}),
      isPartOf: { '@id': `${SITE}/#blog` },
      author: { '@id': PERSON_ID },
      publisher: { '@id': PERSON_ID },
    },
    personNode(opts.lang),
    breadcrumbNode([
      { name: es ? 'Inicio' : 'Home', url: homeUrl(opts.lang) },
      { name: 'Blog', url: blogUrl },
      { name: opts.title, url: opts.url },
    ]),
  ]);
}

/** Blog index: a Blog node listing every post, so crawlers see the whole set from one URL. */
export function blogListJsonLd(opts: {
  lang: Lang;
  url: string;
  name: string;
  description: string;
  posts: { title: string; url: string; description: string; date: Date }[];
}) {
  const es = opts.lang === 'es';
  return graph([
    {
      '@type': 'Blog',
      '@id': `${SITE}/#blog`,
      url: opts.url,
      name: opts.name,
      description: opts.description,
      inLanguage: opts.lang,
      author: { '@id': PERSON_ID },
      publisher: { '@id': PERSON_ID },
      blogPost: opts.posts.map((p) => ({
        '@type': 'BlogPosting',
        headline: p.title,
        description: p.description,
        url: p.url,
        datePublished: p.date.toISOString(),
        author: { '@id': PERSON_ID },
      })),
    },
    personNode(opts.lang),
    breadcrumbNode([
      { name: es ? 'Inicio' : 'Home', url: homeUrl(opts.lang) },
      { name: 'Blog', url: opts.url },
    ]),
  ]);
}

/** Work index: CollectionPage + ItemList of every project. */
export function workListJsonLd(opts: {
  lang: Lang;
  url: string;
  name: string;
  description: string;
  projects: { name: string; url: string; description: string; image?: string }[];
}) {
  const es = opts.lang === 'es';
  return graph([
    {
      '@type': 'CollectionPage',
      '@id': `${opts.url}#collection`,
      url: opts.url,
      name: opts.name,
      description: opts.description,
      inLanguage: opts.lang,
      about: { '@id': PERSON_ID },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: opts.projects.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'CreativeWork',
            name: p.name,
            description: p.description,
            url: p.url,
            ...(p.image ? { image: new URL(p.image, SITE).href } : {}),
            author: { '@id': PERSON_ID },
          },
        })),
      },
    },
    personNode(opts.lang),
    breadcrumbNode([
      { name: es ? 'Inicio' : 'Home', url: homeUrl(opts.lang) },
      { name: es ? 'Proyectos' : 'Work', url: opts.url },
    ]),
  ]);
}

export function projectJsonLd(opts: {
  lang: Lang;
  url: string;
  name: string;
  description: string;
  image?: string;
  tags?: string[];
  year?: string;
  live?: string;
  repo?: string;
}) {
  const es = opts.lang === 'es';
  const sameAs = [opts.live, opts.repo].filter((u): u is string => Boolean(u));
  return graph([
    {
      '@type': 'CreativeWork',
      name: opts.name,
      headline: opts.name,
      description: opts.description,
      url: opts.url,
      inLanguage: opts.lang,
      author: { '@id': PERSON_ID },
      creator: { '@id': PERSON_ID },
      ...(opts.image ? { image: new URL(opts.image, SITE).href } : {}),
      ...(opts.tags?.length ? { keywords: opts.tags.join(', ') } : {}),
      ...(opts.year ? { dateCreated: opts.year } : {}),
      ...(sameAs.length ? { sameAs } : {}),
    },
    personNode(opts.lang),
    breadcrumbNode([
      { name: es ? 'Inicio' : 'Home', url: homeUrl(opts.lang) },
      { name: es ? 'Proyectos' : 'Work', url: `${SITE}${es ? '/work' : '/en/work'}` },
      { name: opts.name, url: opts.url },
    ]),
  ]);
}
